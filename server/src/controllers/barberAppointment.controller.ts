import mongoose from "mongoose";
import type { NextFunction, Response } from "express";
import Appointment from "../models/Appointment";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import AppError from "../utils/AppError";

const barberFilter = (barberId: string) => ({
  $or: [
    { barber: barberId },
    { "staffAssignments.barber": barberId },
  ],
});

const requireBarberId = (req: AuthenticatedRequest): string => {
  if (!req.user?.userId) throw new AppError("Bạn chưa đăng nhập", 401);
  return req.user.userId;
};

export const getBarberAppointments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const barberId = requireBarberId(req);
    const { status, appointmentDate, dateFrom, dateTo } = req.query;
    const query: Record<string, unknown> = barberFilter(barberId);

    if (typeof status === "string" && status) query.status = status;
    if (typeof appointmentDate === "string" && appointmentDate) {
      query.appointmentDate = appointmentDate;
    } else if (dateFrom || dateTo) {
      query.appointmentDate = {
        ...(typeof dateFrom === "string" && dateFrom ? { $gte: dateFrom } : {}),
        ...(typeof dateTo === "string" && dateTo ? { $lte: dateTo } : {}),
      };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, startTime: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
};

export const markBarberAppointmentViewed = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const barberId = requireBarberId(req);
    const id = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Mã lịch hẹn không hợp lệ", 400);

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, ...barberFilter(barberId) },
      { $set: { barberViewedAt: new Date() } },
      { new: true }
    ).lean();
    if (!appointment) throw new AppError("Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập", 404);
    res.json({ success: true, message: "Đã đánh dấu xem lịch hẹn", appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const barberId = requireBarberId(req);
    const id = String(req.params.id || "");
    const status = req.body.status as "IN_PROGRESS" | "COMPLETED";
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Mã lịch hẹn không hợp lệ", 400);
    if (!(["IN_PROGRESS", "COMPLETED"] as const).includes(status)) {
      throw new AppError("Barber chỉ được bắt đầu hoặc hoàn thành lịch hẹn", 400);
    }

    const expectedStatus = status === "IN_PROGRESS" ? "CHECKED_IN" : "IN_PROGRESS";
    const now = new Date();
    const update = status === "IN_PROGRESS"
      ? { status, startedAt: now }
      : {
          status,
          completedAt: now,
          "workProgress.hair": "COMPLETED",
          "workProgress.care": "COMPLETED",
        };

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, status: expectedStatus, ...barberFilter(barberId) },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!appointment) {
      const existing = await Appointment.findOne({ _id: id, ...barberFilter(barberId) }).select("status").lean();
      if (!existing) throw new AppError("Không tìm thấy lịch hẹn hoặc bạn không được phân công", 404);
      throw new AppError(
        status === "IN_PROGRESS"
          ? "Chỉ được bắt đầu khi khách đã check-in"
          : "Chỉ được hoàn thành lịch hẹn đang thực hiện",
        409
      );
    }

    res.json({
      success: true,
      message: status === "IN_PROGRESS" ? "Đã bắt đầu thực hiện lịch hẹn" : "Đã hoàn thành lịch hẹn",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
