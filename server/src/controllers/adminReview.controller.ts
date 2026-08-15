import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import type { ReviewStatus } from "../models/Review";
import * as service from "../services/adminReview.service";
import AppError from "../utils/AppError";

const value = (input: string | string[] | undefined) =>
  Array.isArray(input) ? input[0] ?? "" : input ?? "";

export const getAdminReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.listAdminReviews({
      keyword: value(req.query.keyword as string | string[] | undefined),
      status: value(req.query.status as string | string[] | undefined) as ReviewStatus | "ALL",
      rating: Number(value(req.query.rating as string | string[] | undefined)) || undefined,
      page: Number(value(req.query.page as string | string[] | undefined)) || 1,
      limit: Number(value(req.query.limit as string | string[] | undefined)) || 10,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const changeAdminReviewStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const status = req.body.status as ReviewStatus;
    if (!["PENDING", "APPROVED", "REJECTED", "HIDDEN"].includes(status)) {
      throw new AppError("Trạng thái review không hợp lệ", 400);
    }

    const review = await service.updateAdminReviewStatus(
      value(req.params.id),
      status,
      String(req.body.moderationNote ?? ""),
      req.user.userId
    );
    res.json({ success: true, message: "Cập nhật review thành công", review });
  } catch (error) {
    next(error);
  }
};

export const removeAdminReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await service.deleteAdminReview(value(req.params.id));
    res.json({ success: true, message: "Xóa review thành công", item });
  } catch (error) {
    next(error);
  }
};
