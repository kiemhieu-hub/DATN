import mongoose from "mongoose";

import FavoriteHairstyle from "../models/FavoriteHairstyle";
import AppError from "../utils/AppError";

export interface HairstyleData {
  imageUrl: string;
  title: string;
}

export const addFavorite = async (
  userId: string,
  hairstyle: HairstyleData
): Promise<{ message: string }> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Tài khoản không hợp lệ", 400);
  }

  if (!hairstyle.imageUrl || !hairstyle.title) {
    throw new AppError("Thông tin kiểu tóc không hợp lệ", 400);
  }

  // Kiểm tra đã tồn tại chưa
  const existing = await FavoriteHairstyle.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    imageUrl: hairstyle.imageUrl,
  });

  if (existing) {
    throw new AppError("Kiểu tóc này đã có trong danh sách yêu thích", 400);
  }

  await FavoriteHairstyle.create({
    userId: new mongoose.Types.ObjectId(userId),
    imageUrl: hairstyle.imageUrl,
    title: hairstyle.title,
  });

  return { message: "Đã thêm vào yêu thích" };
};

export const removeFavorite = async (
  userId: string,
  imageUrl: string
): Promise<{ message: string }> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Tài khoản không hợp lệ", 400);
  }

  const result = await FavoriteHairstyle.deleteOne({
    userId: new mongoose.Types.ObjectId(userId),
    imageUrl,
  });

  if (result.deletedCount === 0) {
    throw new AppError("Không tìm thấy kiểu tóc trong danh sách yêu thích", 404);
  }

  return { message: "Đã xóa khỏi yêu thích" };
};

export const getMyFavorites = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Tài khoản không hợp lệ", 400);
  }

  const favorites = await FavoriteHairstyle.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean();

  return favorites;
};

export const checkFavorite = async (
  userId: string,
  imageUrl: string
): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return false;
  }

  const favorite = await FavoriteHairstyle.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    imageUrl,
  });

  return !!favorite;
};
