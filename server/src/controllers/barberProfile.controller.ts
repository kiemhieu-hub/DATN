import {
  type NextFunction,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";

import * as barberProfileService from "../services/barberProfile.service";

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
      return;
    }

    const profile =
      await barberProfileService.getMyBarberProfile(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
      return;
    }

    const profile =
      await barberProfileService.updateMyBarberProfile(
        req.user.userId,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Cập nhật hồ sơ thành công",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};