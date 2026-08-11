import mongoose from "mongoose";
import HairstyleGallery from "../models/HairstyleGallery";
import AppError from "../utils/AppError";

export interface HairstyleInput {
  title: string;
  image: string;
  category?: string;
  description?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

const assertId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã hình ảnh không hợp lệ", 400);
  }
};

const normalize = (input: HairstyleInput) => {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const image = typeof input.image === "string" ? input.image.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const sortOrder = Number(input.sortOrder ?? 0);

  if (title.length < 2 || title.length > 150) {
    throw new AppError("Tên kiểu tóc phải có từ 2 đến 150 ký tự", 400);
  }
  if (!image || image.length > 1000) {
    throw new AppError("Vui lòng nhập đường dẫn hình ảnh hợp lệ", 400);
  }
  if (category.length > 100 || description.length > 1000) {
    throw new AppError("Danh mục hoặc mô tả quá dài", 400);
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AppError("Thứ tự hiển thị phải là số nguyên từ 0", 400);
  }

  return {
    title,
    image,
    category,
    description,
    sortOrder,
    isFeatured: Boolean(input.isFeatured),
    isActive: input.isActive !== false,
  };
};

export const getAdminHairstyles = async () => HairstyleGallery.find()
  .sort({ sortOrder: 1, createdAt: -1 })
  .lean();

export const createAdminHairstyle = async (input: HairstyleInput) =>
  HairstyleGallery.create(normalize(input));

export const updateAdminHairstyle = async (id: string, input: HairstyleInput) => {
  assertId(id);
  const item = await HairstyleGallery.findByIdAndUpdate(id, normalize(input), {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError("Không tìm thấy hình ảnh kiểu tóc", 404);
  return item;
};

export const updateAdminHairstyleStatus = async (id: string, isActive: boolean) => {
  assertId(id);
  if (typeof isActive !== "boolean") throw new AppError("Trạng thái không hợp lệ", 400);
  const item = await HairstyleGallery.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!item) throw new AppError("Không tìm thấy hình ảnh kiểu tóc", 404);
  return item;
};

export const deleteAdminHairstyle = async (id: string) => {
  assertId(id);
  const item = await HairstyleGallery.findByIdAndDelete(id);
  if (!item) throw new AppError("Không tìm thấy hình ảnh kiểu tóc", 404);
  return { id, title: item.title };
};

export const getActiveHairstyles = async (category?: string) => {
  const query: Record<string, unknown> = { isActive: true };
  if (category?.trim()) query.category = category.trim();
  return HairstyleGallery.find(query)
    .select("title image category description sortOrder isFeatured")
    .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
    .lean();
};
