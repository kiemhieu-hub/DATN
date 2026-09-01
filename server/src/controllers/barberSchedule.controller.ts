import {
  type NextFunction,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import * as barberScheduleService from "../services/barberSchedule.service";
import BarberScheduleOverride from "../models/BarberScheduleOverride";

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

/**
 * Đăng ký lịch nghỉ cho Barber / Nhân viên
 * POST /api/barber-schedules/leaves
 */
export const createLeave = async (
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

    const { staffId, startDate, endDate, reasonType, note } = req.body;
    const targetBarberId = staffId || req.user.userId;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc",
      });
      return;
    }

    const result = await barberScheduleService.registerLeaveSchedule({
      staffId: targetBarberId,
      startDate,
      endDate,
      reasonType,
      note,
      createdBy: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: `Đăng ký nghỉ thành công ${result.totalDays} ngày`,
    });
  } catch (error) {
    next(error);
  }
};