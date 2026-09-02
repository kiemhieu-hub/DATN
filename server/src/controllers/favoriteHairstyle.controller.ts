import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import * as favoriteService from "../services/favoriteHairstyle.service";
import AppError from "../utils/AppError";

const requireUserId = (req: AuthenticatedRequest): string => {
  if (!req.user) {
    throw new AppError("Bạn chưa đăng nhập", 401);
  }

  return req.user.userId;
};

export const getMyFavoriteHairstyles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const favorites = await favoriteService.getMyFavorites(
      requireUserId(req)
    );

    res.json({ success: true, items: favorites });
  } catch (error) {
    next(error);
  }
};

export const addFavoriteHairstyle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const favorite = await favoriteService.addFavorite(
      requireUserId(req),
      {
        imageUrl: req.body.imageUrl,
        title: req.body.title,
        category: req.body.category,
      }
    );

    res.status(201).json({
      success: true,
      message: "Đã thêm vào kiểu tóc yêu thích",
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteHairstyle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await favoriteService.removeFavorite(
      requireUserId(req),
      String(req.params.favoriteId)
    );

    res.json({
      success: true,
      message: "Đã bỏ khỏi kiểu tóc yêu thích",
    });
  } catch (error) {
    next(error);
  }
};