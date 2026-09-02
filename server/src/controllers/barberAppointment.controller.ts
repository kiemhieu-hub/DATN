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

    const appointment = await Appointment.findOne({ _id: id, ...barberFilter(barberId) });
    if (!appointment) throw new AppError("Không tìm thấy lịch hẹn hoặc bạn không được phân công", 404);
    if (!["CHECKED_IN", "IN_PROGRESS"].includes(appointment.status)) {
      throw new AppError(status === "IN_PROGRESS" ? "Chỉ được bắt đầu khi khách đã check-in" : "Chỉ được hoàn thành lịch hẹn đang thực hiện", 409);
    }
    const segments = appointment.staffAssignments.filter((item) => String(item.barber) === barberId).map((item) => item.staffType);
    if (!segments.length && String(appointment.barber) === barberId) segments.push("HAIR");
    if (!segments.length) throw new AppError("Bạn không có phần việc trong lịch hẹn này", 403);
    const now = new Date();
    for (const segment of segments) {
      const key = segment === "HAIR" ? "hair" : "care";
      if (status === "IN_PROGRESS") {
        if (appointment.workProgress[key] !== "PENDING") throw new AppError("Phần việc đã bắt đầu hoặc hoàn thành", 409);
        appointment.workProgress[key] = "IN_PROGRESS";
        if (segment === "HAIR") appointment.workProgress.hairStartedAt = now; else appointment.workProgress.careStartedAt = now;
      } else {
        if (appointment.workProgress[key] !== "IN_PROGRESS") throw new AppError("Bạn phải bắt đầu phần việc trước khi hoàn thành", 409);
        appointment.workProgress[key] = "COMPLETED";
        if (segment === "HAIR") appointment.workProgress.hairCompletedAt = now; else appointment.workProgress.careCompletedAt = now;
      }
    }
    appointment.status = "IN_PROGRESS";
    appointment.startedAt ??= now;
    const allDone = [appointment.workProgress.hair, appointment.workProgress.care].every((value) => value === "NOT_REQUIRED" || value === "COMPLETED");
    if (allDone) { appointment.status = "COMPLETED"; appointment.completedAt = now; appointment.slotKeys = []; }
    await appointment.save();

    res.json({
      success: true,
      message: status === "IN_PROGRESS" ? "Đã bắt đầu phần việc của bạn" : allDone ? "Tất cả phần việc đã hoàn thành" : "Đã hoàn thành phần việc, đang chờ nhân viên còn lại",
      appointment: appointment.toObject(),
    });
  } catch (error) {
    next(error);
  }
};
