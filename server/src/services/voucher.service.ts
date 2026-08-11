import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import Service, { type ServiceGroup } from "../models/Service";
import Voucher, { type IVoucher } from "../models/Voucher";
import AppError from "../utils/AppError";

export interface VoucherLineItem {
  price: number;
  group: ServiceGroup;
}

interface EvaluateVoucherInput {
  code: string;
  clientId: string;
  items: VoucherLineItem[];
  barberIds: string[];
}

export interface VoucherCalculation {
  voucherId: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  depositRequired: boolean;
  depositAmount: number;
}

export interface AvailableVoucher extends VoucherCalculation {
  name: string;
  description: string;
  endDate: Date;
}

const normalizeCode = (code: string): string => {
  if (typeof code !== "string" || !code.trim()) {
    throw new AppError("Vui lòng nhập mã voucher", 400);
  }
  return code.trim().toUpperCase();
};

const assertVoucherAvailable = async (
  voucher: IVoucher,
  clientId: string
): Promise<void> => {
  const now = new Date();

  if (!voucher.isActive) {
    throw new AppError("Voucher đang bị khóa", 400);
  }
  if (voucher.startDate.getTime() > now.getTime()) {
    throw new AppError("Voucher chưa đến thời gian sử dụng", 400);
  }
  if (voucher.endDate.getTime() < now.getTime()) {
    throw new AppError("Voucher đã hết hạn", 400);
  }
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    throw new AppError("Voucher đã hết lượt sử dụng", 400);
  }

  if (voucher.perUserLimit > 0) {
    const usedByClient = await Appointment.countDocuments({
      client: clientId,
      voucherCode: voucher.code,
      status: { $ne: "CANCELLED" },
    });

    if (usedByClient >= voucher.perUserLimit) {
      throw new AppError("Bạn đã sử dụng hết số lượt cho voucher này", 400);
    }
  }
};

export const evaluateVoucher = async (
  input: EvaluateVoucherInput
): Promise<VoucherCalculation> => {
  if (!mongoose.Types.ObjectId.isValid(input.clientId)) {
    throw new AppError("Tài khoản khách hàng không hợp lệ", 400);
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError("Vui lòng chọn dịch vụ trước khi áp dụng voucher", 400);
  }

  const code = normalizeCode(input.code);
  const voucher = await Voucher.findOne({ code });
  if (!voucher) {
    throw new AppError("Mã voucher không tồn tại", 404);
  }

  await assertVoucherAvailable(voucher, input.clientId);

  const subtotal = input.items.reduce((sum, item) => sum + item.price, 0);
  if (subtotal < voucher.minOrder) {
    throw new AppError(
      `Đơn hàng tối thiểu để dùng voucher là ${voucher.minOrder.toLocaleString("vi-VN")}đ`,
      400
    );
  }

  const allowedBarbers = voucher.applicableBarbers.map(String);
  if (
    allowedBarbers.length > 0 &&
    !input.barberIds.some((barberId) => allowedBarbers.includes(barberId))
  ) {
    throw new AppError("Voucher không áp dụng cho Barber đã chọn", 400);
  }

  const allowedGroups = voucher.applicableServiceGroups;
  const eligibleSubtotal = input.items
    .filter((item) => allowedGroups.length === 0 || allowedGroups.includes(item.group))
    .reduce((sum, item) => sum + item.price, 0);

  if (eligibleSubtotal <= 0) {
    throw new AppError("Voucher không áp dụng cho các dịch vụ đã chọn", 400);
  }

  let discountAmount = voucher.type === "PERCENT"
    ? Math.round(eligibleSubtotal * voucher.value / 100)
    : Math.round(voucher.value);

  // Giới hạn giảm tối đa chỉ áp dụng cho voucher phần trăm.
  // Voucher số tiền cố định luôn giảm đúng giá trị đã cấu hình.
  if (voucher.type === "PERCENT" && voucher.maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, voucher.maxDiscount);
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const total = Math.max(0, subtotal - discountAmount);
  const depositRequired = subtotal > 200000;

  return {
    voucherId: String(voucher._id),
    code: voucher.code,
    type: voucher.type,
    value: voucher.value,
    discountPercent: voucher.type === "PERCENT" ? voucher.value : 0,
    discountAmount,
    subtotal,
    total,
    depositRequired,
    depositAmount: depositRequired ? Math.round(subtotal * 0.3) : 0,
  };
};

export const evaluateVoucherFromServiceIds = async (
  code: string,
  clientId: string,
  serviceIds: string[],
  barberIds: string[]
): Promise<VoucherCalculation> => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new AppError("Vui lòng chọn dịch vụ trước khi áp dụng voucher", 400);
  }
  if (serviceIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new AppError("Danh sách dịch vụ không hợp lệ", 400);
  }

  const services = await Service.find({
    _id: { $in: serviceIds },
    isActive: true,
  }).select("price group");

  if (services.length !== new Set(serviceIds).size) {
    throw new AppError("Có dịch vụ không tồn tại hoặc đã ngừng hoạt động", 400);
  }

  return evaluateVoucher({
    code,
    clientId,
    barberIds,
    items: services.map((service) => ({
      price: service.price,
      group: service.group,
    })),
  });
};

export const getAvailableVouchersFromServiceIds = async (
  clientId: string,
  serviceIds: string[],
  barberIds: string[]
): Promise<AvailableVoucher[]> => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return [];
  }

  const vouchers = await Voucher.find({ isActive: true })
    .sort({ value: -1, endDate: 1 });

  const calculations = await Promise.all(
    vouchers.map(async (voucher) => {
      try {
        const calculation = await evaluateVoucherFromServiceIds(
          voucher.code,
          clientId,
          serviceIds,
          barberIds
        );

        return {
          ...calculation,
          name: voucher.name,
          description: voucher.description,
          endDate: voucher.endDate,
        };
      } catch {
        return null;
      }
    })
  );

  return calculations.filter(
    (item): item is AvailableVoucher => item !== null
  );
};

export const consumeVoucher = async (voucherId: string): Promise<void> => {
  const voucher = await Voucher.findOneAndUpdate(
    {
      _id: voucherId,
      isActive: true,
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!voucher) {
    throw new AppError("Voucher vừa hết lượt sử dụng, vui lòng chọn mã khác", 409);
  }
};
