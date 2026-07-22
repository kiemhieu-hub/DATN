import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import type { AppointmentStatus } from "../models/Appointment";
import * as service from "../services/adminAppointment.service";
import AppError from "../utils/AppError";

const idParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listAdminAppointments({
      keyword: typeof req.query.keyword === "string" ? req.query.keyword : undefined,
      status: typeof req.query.status === "string" ? req.query.status as AppointmentStatus | "ALL" : undefined,
      barberId: typeof req.query.barberId === "string" ? req.query.barberId : undefined,
      appointmentDate: typeof req.query.appointmentDate === "string" ? req.query.appointmentDate : undefined,
      appointmentTime: typeof req.query.appointmentTime === "string" ? req.query.appointmentTime : undefined,
      sortOrder: req.query.sortOrder === "newest" || req.query.sortOrder === "oldest"
        ? req.query.sortOrder
        : "priority",
      page: Number(req.query.page), limit: Number(req.query.limit),
    });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.getAdminAppointmentDetail(idParam(req.params.id));
    res.json({ success: true, appointment });
  } catch (error) { next(error); }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const appointment = await service.changeAdminAppointmentStatus(
      idParam(req.params.id), req.user.userId, req.user.role as "ADMIN" | "RECEPTIONIST", req.body.status, req.body.reason
    );
    res.json({ success: true, message: "Cập nhật trạng thái lịch hẹn thành công", appointment });
  } catch (error) { next(error); }
};

export const reschedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.rescheduleAppointment(
      idParam(req.params.id), req.body.appointmentDate, req.body.startTime, req.body.customerConsent
    );
    res.json({ success: true, message: "Đổi lịch hẹn thành công", appointment });
  } catch (error) { next(error); }
};

export const updateServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.replaceAppointmentServices(idParam(req.params.id), req.body.serviceIds);
    res.json({ success: true, message: "Cập nhật dịch vụ phát sinh thành công", appointment });
  } catch (error) { next(error); }
};

export const changeBarber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.reassignAppointmentBarber(idParam(req.params.id), req.body.barberId);
    res.json({ success: true, message: "Đổi Barber thành công", appointment });
  } catch (error) { next(error); }
};

export const reopenNoShow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.reopenNoShowAppointment(
      idParam(req.params.id), req.body.mode, req.body.appointmentDate,
      req.body.startTime, req.body.barberId
    );
    res.json({ success: true, message: "Bật lại lịch hẹn thành công", appointment });
  } catch (error) { next(error); }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await service.deleteAdminAppointment(idParam(req.params.id));
    res.json({ success: true, message: "Xóa lịch hẹn thành công", appointment });
  } catch (error) { next(error); }
};
