import mongoose from "mongoose";

import Service, {
  type ServiceGroup,
} from "../models/Service";
import AppError from "../utils/AppError";
import BarberProfile from "../models/BarberProfile";

export interface AdminServiceInput {
  name?: string;
  description?: string;
  price?: number;
  priceFrom?: boolean;
  durationMinutes?: number;
  group?: ServiceGroup;
  isExclusiveInGroup?: boolean;
  image?: string;
  isActive?: boolean;
}

interface GetAdminServicesInput {
  keyword?: string;
  group?: ServiceGroup | "ALL";
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  page?: number;
  limit?: number;
}

const GROUPS: ServiceGroup[] = [
  "HAIRCUT",
  "BEARD",
  "COLOR",
  "CARE",
  "OTHER",
];

const assertObjectId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã dịch vụ không hợp lệ", 400);
  }
};

const normalizePayload = (
  input: AdminServiceInput,
  partial = false
): AdminServiceInput => {
  const payload: AdminServiceInput = {};

  if (!partial || input.name !== undefined) {
    const name = String(input.name ?? "").trim();
    if (name.length < 2 || name.length > 150) {
      throw new AppError("Tên dịch vụ phải từ 2 đến 150 ký tự", 400);
    }
    payload.name = name;
  }

  if (!partial || input.price !== undefined) {
    const price = Number(input.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new AppError("Giá dịch vụ không hợp lệ", 400);
    }
    payload.price = price;
  }

  if (!partial || input.durationMinutes !== undefined) {
    const duration = Number(input.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      throw new AppError("Thời lượng phải từ 1 đến 1440 phút", 400);
    }
    payload.durationMinutes = duration;
  }

  if (!partial || input.group !== undefined) {
    if (!GROUPS.includes(input.group as ServiceGroup)) {
      throw new AppError("Nhóm dịch vụ không hợp lệ", 400);
    }
    payload.group = input.group;
  }

  if (input.description !== undefined) {
    payload.description = String(input.description).trim();
  }
  if (input.image !== undefined) {
    payload.image = String(input.image).trim();
  }
  if (input.priceFrom !== undefined) {
    payload.priceFrom = Boolean(input.priceFrom);
  }
  if (input.isActive !== undefined) {
    payload.isActive = Boolean(input.isActive);
  }

  // Theo quy tắc dự án, chỉ HAIRCUT và COLOR là nhóm chọn độc quyền.
  if (payload.group !== undefined) {
    payload.isExclusiveInGroup =
      payload.group === "HAIRCUT" || payload.group === "COLOR";
  } else if (input.isExclusiveInGroup !== undefined) {
    payload.isExclusiveInGroup = Boolean(input.isExclusiveInGroup);
  }

  return payload;
};

const serialize = (service: any) => ({
  id: String(service._id),
  name: service.name,
  description: service.description,
  price: service.price,
  priceFrom: service.priceFrom,
  durationMinutes: service.durationMinutes,
  group: service.group,
  isExclusiveInGroup: service.isExclusiveInGroup,
  image: service.image,
  isActive: service.isActive,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
});

export const getAdminServices = async (input: GetAdminServicesInput) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(input.limit) || 10));
  const query: Record<string, unknown> = {};

  if (input.keyword?.trim()) {
    query.$or = [
      { name: { $regex: input.keyword.trim(), $options: "i" } },
      { description: { $regex: input.keyword.trim(), $options: "i" } },
    ];
  }
  if (input.group && input.group !== "ALL") query.group = input.group;
  if (input.status && input.status !== "ALL") {
    query.isActive = input.status === "ACTIVE";
  }

  const [items, totalItems] = await Promise.all([
    Service.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Service.countDocuments(query),
  ]);

  return {
    items: items.map(serialize),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
};

export const getAdminServiceById = async (id: string) => {
  assertObjectId(id);
  const service = await Service.findById(id).lean();
  if (!service) throw new AppError("Không tìm thấy dịch vụ", 404);
  return serialize(service);
};

export const createAdminService = async (input: AdminServiceInput) => {
  const payload = normalizePayload(input);
  const duplicated = await Service.exists({
    name: { $regex: `^${String(payload.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });
  if (duplicated) throw new AppError("Tên dịch vụ đã tồn tại", 409);

  const service = await Service.create({
    ...payload,
    description: payload.description ?? "",
    image: payload.image ?? "",
    priceFrom: payload.priceFrom ?? false,
    isActive: payload.isActive ?? true,
  });
  return serialize(service.toObject());
};

export const updateAdminService = async (id: string, input: AdminServiceInput) => {
  assertObjectId(id);
  const payload = normalizePayload(input, true);
  if (payload.name) {
    const duplicated = await Service.exists({
      _id: { $ne: id },
      name: { $regex: `^${payload.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicated) throw new AppError("Tên dịch vụ đã tồn tại", 409);
  }

  const current = await Service.findById(id);
  if (!current) throw new AppError("Không tìm thấy dịch vụ", 404);
  if (payload.group === undefined && current.group) {
    payload.isExclusiveInGroup = current.group === "HAIRCUT" || current.group === "COLOR";
  }
  Object.assign(current, payload);
  await current.save();
  return serialize(current.toObject());
};

export const updateAdminServiceStatus = async (id: string, isActive: unknown) => {
  assertObjectId(id);
  if (typeof isActive !== "boolean") {
    throw new AppError("Trạng thái dịch vụ không hợp lệ", 400);
  }
  const service = await Service.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).lean();
  if (!service) throw new AppError("Không tìm thấy dịch vụ", 404);
  return serialize(service);
};

export const deleteAdminService = async (id: string) => {
  assertObjectId(id);
  const service = await Service.findByIdAndDelete(id).lean();
  if (!service) throw new AppError("Không tìm thấy dịch vụ", 404);

  await BarberProfile.updateMany(
    { specialties: service._id },
    { $pull: { specialties: service._id } }
  );

  return serialize(service);
};
