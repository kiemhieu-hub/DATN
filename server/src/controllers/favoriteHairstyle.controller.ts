import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../services/favoriteHairstyle.service";

export const getMyFavoriteHairstyles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await getMyFavorites(req.user!.userId);
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const addFavoriteHairstyle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await addFavorite(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Đã thêm kiểu tóc vào danh sách yêu thích",
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteHairstyle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await removeFavorite(req.user!.userId, String(req.params.id));
    res.json({ success: true, message: "Đã bỏ kiểu tóc khỏi yêu thích" });
  } catch (error) {
    next(error);
  }
};
