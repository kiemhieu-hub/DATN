import type { NextFunction, Request, Response } from "express";

import { getActiveHairstyles } from "../services/adminHairstyleGallery.service";

export const getPublicHairstyles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    res.json({ success: true, items: await getActiveHairstyles(category) });
  } catch (error) { next(error); }
};
