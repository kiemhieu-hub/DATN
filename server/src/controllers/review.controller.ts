import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import * as reviewService from "../services/review.service";
import AppError from "../utils/AppError";

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const review = await reviewService.createClientReview(req.user.userId, {
      appointmentId: String(req.body.appointmentId ?? ""),
      barberRating: Number(req.body.barberRating),
      barberComment: req.body.barberComment,
      serviceRatings: req.body.serviceRatings,
    });
    res.status(201).json({
      success: true,
      message: "Gửi đánh giá thành công. Đánh giá đang chờ Admin duyệt.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const reviews = await reviewService.getMyReviews(req.user.userId);
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const getApprovedByBarber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const barberId = Array.isArray(req.params.barberId)
      ? (req.params.barberId[0] ?? "")
      : (req.params.barberId ?? "");
    const reviews = await reviewService.getApprovedBarberReviews(barberId);
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
