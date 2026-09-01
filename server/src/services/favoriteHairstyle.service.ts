import mongoose from "mongoose";

import FavoriteHairstyle from "../models/FavoriteHairstyle";
import AppError from "../utils/AppError";

export interface FavoriteHairstylePayload {
  imageUrl: string;
  title: string;
  category?: string;
}

const toObjectId = (value: string, message: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(message, 400);
  }

  return new mongoose.Types.ObjectId(value);
};

export const getMyFavorites = async (userId: string) => {
  const clientId = toObjectId(userId, "Tài khoản không hợp lệ");

  return FavoriteHairstyle.find({ userId: clientId })
    .sort({ createdAt: -1 })
    .lean();
};

export const addFavorite = async (
  userId: string,
  payload: FavoriteHairstylePayload
) => {
  const clientId = toObjectId(userId, "Tài khoản không hợp lệ");
  const imageUrl = String(payload.imageUrl ?? "").trim();
  const title = String(payload.title ?? "").trim();

  if (!imageUrl || !title) {
    throw new AppError("Thông tin kiểu tóc không hợp lệ", 400);
  }

  const existing = await FavoriteHairstyle.findOne({
    userId: clientId,
    imageUrl,
  });

  if (existing) {
    return existing;
  }

  return FavoriteHairstyle.create({
    userId: clientId,
    imageUrl,
    title,
    category: String(payload.category ?? "").trim(),
  });
};

export const removeFavorite = async (
  userId: string,
  favoriteId: string
) => {
  const clientId = toObjectId(userId, "Tài khoản không hợp lệ");
  const recordId = toObjectId(favoriteId, "Mục yêu thích không hợp lệ");

  const removed = await FavoriteHairstyle.findOneAndDelete({
    _id: recordId,
    userId: clientId,
  });

  if (!removed) {
    throw new AppError("Không tìm thấy kiểu tóc yêu thích", 404);
  }

  return removed;
};