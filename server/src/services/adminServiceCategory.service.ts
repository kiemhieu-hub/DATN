import mongoose from "mongoose";
import Service from "../models/Service";
import ServiceCategory from "../models/ServiceCategory";
import AppError from "../utils/AppError";

export interface ServiceCategoryInput { 
    name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

const assertId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã danh mục không hợp lệ", 400);
  }
};

const slugify = (value: string): string => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


const normalize = (input: ServiceCategoryInput) => { 
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const slug = slugify(typeof input.slug === "string" && input.slug.trim() ? input.slug : name);
    const sortOrder = Number(input.sortOrder ?? 0);
    if (name.length < 2 || name.length > 100) {
    throw new AppError("Tên danh mục phải có từ 2 đến 100 ký tự", 400);
  }
  if (!slug || slug.length > 120) {
    throw new AppError("Đường dẫn danh mục không hợp lệ", 400);
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AppError("Thứ tự hiển thị phải là số nguyên từ 0", 400);
  }
  return {
    name,
    slug,
    description: typeof input.description === "string" ? input.description.trim() : "",
    sortOrder,
    isActive: input.isActive !== false,
  };
};

    const withServiceCount = async () => {
        const categories = await ServiceCategory.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();

    const counts = await Service.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { category: { $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
  return categories.map((category) => ({
    ...category,
    serviceCount: countMap.get(String(category._id)) ?? 0,
  }));
};

    export const getAdminServiceCategories = withServiceCount;

    export const createAdminServiceCategory = async (input: ServiceCategoryInput) => {
        const data = normalize(input);
        const duplicated = await ServiceCategory.exists({
            $or: [{ name: data.name }, { slug: data.slug }],
  });
    if (duplicated) throw new AppError("Tên hoặc mã danh mục đã tồn tại", 409);
  return ServiceCategory.create(data);
};

    export const updateAdminServiceCategory = async (id: string, input: ServiceCategoryInput) => {
        assertId(id);
        const data = normalize(input);
        const duplicated = await ServiceCategory.exists({
            _id: { $ne: id },
        $or: [{ name: data.name }, { slug: data.slug }],
        });
        if (duplicated) throw new AppError("Tên hoặc mã danh mục đã tồn tại", 409);

        const category = await ServiceCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!category) throw new AppError("Không tìm thấy danh mục", 404);
  return category;

    };

    export const updateAdminServiceCategoryStatus = async (id: string, isActive: boolean) => {
        assertId(id);
  if (typeof isActive !== "boolean") throw new AppError("Trạng thái không hợp lệ", 400);
  const category = await ServiceCategory.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!category) throw new AppError("Không tìm thấy danh mục", 404);
  return category;
};

export const deleteAdminServiceCategory = async (id: string) => {
  assertId(id);
  const serviceCount = await Service.countDocuments({ category: id });
  if (serviceCount > 0) {
    throw new AppError(`Không thể xóa vì danh mục đang chứa ${serviceCount} dịch vụ`, 409);
  }
  const category = await ServiceCategory.findByIdAndDelete(id);
  if (!category) throw new AppError("Không tìm thấy danh mục", 404);
  return { id, name: category.name };

}