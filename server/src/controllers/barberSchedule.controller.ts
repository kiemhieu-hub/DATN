import {
  type NextFunction,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";

import * as barberScheduleService from "../services/barberSchedule.service";

export const getMySchedule = async (
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

    const schedules =
      await barberScheduleService.getMyWeeklySchedule(
        req.user.userId
      );

    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWeeklySchedule = async (
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

    const schedules =
      await barberScheduleService.updateMyWeeklySchedule(
        req.user.userId,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Cập nhật lịch làm việc thành công",
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleDay = async (
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

    const schedule =
      await barberScheduleService.updateMyScheduleDay(
        req.user.userId,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Đã cập nhật ngày làm việc",
      schedule,
    });
  } catch (error) {
    next(error);
  }
};