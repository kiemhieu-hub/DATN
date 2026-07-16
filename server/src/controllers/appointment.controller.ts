import {
  type NextFunction,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";

import {
  cancelMyAppointment,
  createAppointment,
  getMyAppointments,
} from "../services/appointment.service";

/**
 * CLIENT tạo lịch hẹn mới
 * POST /api/appointments
 */
export const create = async (
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

    const appointment = await createAppointment(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CLIENT xem danh sách lịch hẹn của mình
 * GET /api/appointments/my
 */
export const getMine = async (
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

    const appointments = await getMyAppointments(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CLIENT hủy lịch hẹn của mình
 * PATCH /api/appointments/:id/cancel
 */
export const cancelMine = async (
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

    const appointmentId = req.params.id;

    if (typeof appointmentId !== "string") {
      res.status(400).json({
        success: false,
        message: "Mã lịch hẹn không hợp lệ",
      });
      return;
    }

    const appointment = await cancelMyAppointment({
      appointmentId,
      clientId: req.user.userId,
      cancelReason: req.body.cancelReason,
    });

    res.status(200).json({
      success: true,
      message: "Hủy lịch thành công",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};