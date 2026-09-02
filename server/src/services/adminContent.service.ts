import mongoose from "mongoose";

import HairstyleGallery from "../models/HairstyleGallery";
import Review from "../models/Review";
import ServiceCategory from "../models/ServiceCategory";
import Voucher from "../models/Voucher";
import AppError from "../utils/AppError";

const assertId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã dữ liệu không hợp lệ", 400);
  }
};

const list = async (model: any) => model.find().sort({ createdAt: -1 }).lean();

const remove = async (model: any, id: string, notFoundMessage: string) => {
  assertId(id);
  const item = await model.findByIdAndDelete(id).lean();
  if (!item) throw new AppError(notFoundMessage, 404);
  return { id };
};

export const listVouchers = () => list(Voucher);
export const deleteVoucher = (id: string) => remove(Voucher, id, "Không tìm thấy voucher");

export const listReviews = () => Review.find()
  .populate("client", "fullName email phone")
  .populate("barber", "fullName email phone")
  .sort({ createdAt: -1 })
  .lean();
export const deleteReview = (id: string) => remove(Review, id, "Không tìm thấy review");

export const listServiceCategories = () => list(ServiceCategory);
export const deleteServiceCategory = (id: string) =>
  remove(ServiceCategory, id, "Không tìm thấy danh mục dịch vụ");

export const listHairstyles = () => list(HairstyleGallery);
export const deleteHairstyle = (id: string) =>
  remove(HairstyleGallery, id, "Không tìm thấy hình ảnh kiểu tóc");
