import mongoose from "mongoose";

import type { ServiceGroup } from "../models/Service";
import User from "../models/User";
import Voucher from "../models/Voucher";
import AppError from "../utils/AppError";

export interface VoucherInput {
  code: string;
  name: string;
  description?: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount?: number;
  minOrder?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  applicableServiceGroups?: ServiceGroup[];
  applicableBarbers?: string[];
  isActive?: boolean;
}

const allowedGroups: ServiceGroup[] = ["HAIRCUT", "BEARD", "COLOR", "CARE", "OTHER"];

const assertId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã voucher không hợp lệ", 400);
  }
};

const normalizeInput = async (input: VoucherInput) => {
  const code = typeof input.code === "string" ? input.code.trim().toUpperCase() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const type = input.type;
  const value = Number(input.value);
  const maxDiscount = Number(input.maxDiscount ?? 0);
  const minOrder = Number(input.minOrder ?? 0);
  const usageLimit = Number(input.usageLimit ?? 0);
  const perUserLimit = Number(input.perUserLimit ?? 1);
  const startDate = new Date(`${input.startDate}T00:00:00`);
  const endDate = new Date(`${input.endDate}T23:59:59.999`);
  const groups = Array.isArray(input.applicableServiceGroups)
    ? [...new Set(input.applicableServiceGroups)]
    : [];
  const barberIds = Array.isArray(input.applicableBarbers)
    ? [...new Set(input.applicableBarbers)]
    : [];

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw new AppError("Mã voucher gồm 3-30 ký tự chữ, số, gạch ngang hoặc gạch dưới", 400);
  }
  if (name.length < 3 || name.length > 150) {
    throw new AppError("Tên voucher phải có từ 3 đến 150 ký tự", 400);
  }
  if (!(["PERCENT", "FIXED"] as const).includes(type)) {
    throw new AppError("Loại voucher không hợp lệ", 400);
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError("Giá trị giảm phải lớn hơn 0", 400);
  }
  if (type === "PERCENT" && value > 100) {
    throw new AppError("Phần trăm giảm không được vượt quá 100%", 400);
  }
  if ([maxDiscount, minOrder, usageLimit].some((number) => !Number.isInteger(number) || number < 0)) {
    throw new AppError("Giá trị tiền và giới hạn sử dụng không hợp lệ", 400);
  }
  if (!Number.isInteger(perUserLimit) || perUserLimit < 1) {
    throw new AppError("Giới hạn mỗi khách phải từ 1 lượt", 400);
  }
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError("Ngày bắt đầu hoặc kết thúc không hợp lệ", 400);
  }
  if (endDate.getTime() <= startDate.getTime()) {
    throw new AppError("Ngày kết thúc phải sau ngày bắt đầu", 400);
  }
  if (groups.some((group) => !allowedGroups.includes(group))) {
    throw new AppError("Nhóm dịch vụ áp dụng không hợp lệ", 400);
  }
  if (barberIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new AppError("Danh sách Barber áp dụng không hợp lệ", 400);
  }

  if (barberIds.length > 0) {
    const barberCount = await User.countDocuments({
      _id: { $in: barberIds },
      role: "BARBER",
    });
    if (barberCount !== barberIds.length) {
      throw new AppError("Có Barber áp dụng không tồn tại", 400);
    }
  }

  return {
    code,
    name,
    description: typeof input.description === "string" ? input.description.trim() : "",
    type,
    value,
    maxDiscount,
    minOrder,
    startDate,
    endDate,
    usageLimit,
    perUserLimit,
    applicableServiceGroups: groups,
    applicableBarbers: barberIds,
    isActive: input.isActive !== false,
  };
};

export const getAdminVouchers = async () => Voucher.find()
  .populate("applicableBarbers", "fullName email")
  .sort({ createdAt: -1 })
  .lean();

export const createAdminVoucher = async (input: VoucherInput) => {
  const data = await normalizeInput(input);
  const existed = await Voucher.exists({ code: data.code });
  if (existed) throw new AppError("Mã voucher đã tồn tại", 409);

  const voucher = await Voucher.create(data);
  return Voucher.findById(voucher._id)
    .populate("applicableBarbers", "fullName email")
    .lean();
};

export const updateAdminVoucher = async (id: string, input: VoucherInput) => {
  assertId(id);
  const data = await normalizeInput(input);
  const duplicated = await Voucher.exists({ code: data.code, _id: { $ne: id } });
  if (duplicated) throw new AppError("Mã voucher đã tồn tại", 409);

  const voucher = await Voucher.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("applicableBarbers", "fullName email");
  if (!voucher) throw new AppError("Không tìm thấy voucher", 404);
  return voucher;
};

export const updateAdminVoucherStatus = async (id: string, isActive: boolean) => {
  assertId(id);
  if (typeof isActive !== "boolean") throw new AppError("Trạng thái không hợp lệ", 400);

  const voucher = await Voucher.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).populate("applicableBarbers", "fullName email");
  if (!voucher) throw new AppError("Không tìm thấy voucher", 404);
  return voucher;
};

export const deleteAdminVoucher = async (id: string) => {
  assertId(id);
  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) throw new AppError("Không tìm thấy voucher", 404);
  return { id, code: voucher.code };
};
