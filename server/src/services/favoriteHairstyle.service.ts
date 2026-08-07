import mongoose from "mongoose";

import FavoriteHairstyle from "../models/FavoriteHairstyle";
import AppError from "../utils/AppError";

interface HairstyleData {
  imageUrl: string;
  title: string;
  category?: string;
}

const validateUserId = (userId: string): void => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Tài khoản không hợp lệ", 400);
  }
};

export const getMyFavorites = async (userId: string) => {
  validateUserId(userId);
  return FavoriteHairstyle.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

export const addFavorite = async (
  userId: string,
  input: HairstyleData
) => {
  validateUserId(userId);
  if (!input.imageUrl?.trim() || !input.title?.trim()) {
    throw new AppError("Thông tin kiểu tóc không hợp lệ", 400);
  }

  const favorite = await FavoriteHairstyle.findOneAndUpdate(
    { userId, imageUrl: input.imageUrl.trim() },
    {
      $setOnInsert: {
        userId,
        imageUrl: input.imageUrl.trim(),
        title: input.title.trim(),
        category: input.category?.trim() ?? "",
      },
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return favorite;
};

export const removeFavorite = async (userId: string, favoriteId: string) => {
  validateUserId(userId);
  if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
    throw new AppError("Kiểu tóc yêu thích không hợp lệ", 400);
  }

  const deleted = await FavoriteHairstyle.findOneAndDelete({
    _id: favoriteId,
    userId,
  });

  if (!deleted) {
    throw new AppError("Không tìm thấy kiểu tóc yêu thích", 404);
  }
};

export const removeFavoriteByImage = async (userId: string, imageUrl: string) => {
  validateUserId(userId);
  const deleted = await FavoriteHairstyle.findOneAndDelete({ userId, imageUrl });
  if (!deleted) throw new AppError("Không tìm thấy kiểu tóc yêu thích", 404);
};
