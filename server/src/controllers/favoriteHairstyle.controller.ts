import { type Request, type Response } from "express";

import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
} from "../services/favoriteHairstyle.service";

export const addFavoriteHairstyle = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.userId;
  const { imageUrl, title } = req.body;

  const result = await addFavorite(userId, { imageUrl, title });

  res.status(201).json({
    success: true,
    ...result,
  });
};

export const removeFavoriteHairstyle = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.userId;
  const { imageUrl } = req.params;

  const result = await removeFavorite(userId, decodeURIComponent(imageUrl));

  res.json({
    success: true,
    ...result,
  });
};

export const getMyFavoriteHairstyles = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.userId;

  const favorites = await getMyFavorites(userId);

  res.json({
    success: true,
    data: favorites,
  });
};
