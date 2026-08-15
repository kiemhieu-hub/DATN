import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import * as service from "../services/staffNotification.service";
import AppError from "../utils/AppError";

const staff = (req: AuthenticatedRequest) => {
  if (
    !req.user ||
    !["ADMIN", "RECEPTIONIST"].includes(
      req.user.role
    )
  ) {
    throw new AppError(
      "Bạn chưa đăng nhập",
      401
    );
  }
  return {
    userId: req.user.userId,
    role: req.user.role as
      | "ADMIN"
      | "RECEPTIONIST",
  };
};

export const listNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const current = staff(req);
    const result =
      await service.getStaffNotifications(
        current.userId,
        current.role,
        req.query.unreadOnly === "true"
      );
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const current = staff(req);
    const id = Array.isArray(req.params.id)
      ? req.params.id[0] ?? ""
      : req.params.id ?? "";
    await service.markNotificationRead(
      id,
      current.userId,
      current.role
    );
    res.json({
      success: true,
      message: "Đã đọc thông báo",
    });
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const current = staff(req);
    await service.markAllNotificationsRead(
      current.userId,
      current.role
    );
    res.json({
      success: true,
      message: "Đã đọc tất cả thông báo",
    });
  } catch (error) {
    next(error);
  }
};
