import {type NextFunction,type Request,type Response,} from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import {
  cancelMyAppointment,
  createAppointment,
  getAdminAppointments,
  getAvailableSlots,
  getBarberAppointments,
  markBarberAppointmentViewed,
  getMyAppointments,
  rescheduleMyAppointment,
  updateAppointmentStatus,
} from "../services/appointment.service";

import AppError from "../utils/AppError";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const getStringParam = (
  value: string | string[] | undefined,
  message: string
): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(message, 400);
  }

  return value.trim();
};

/**
 * CLIENT tạo lịch mới
 * POST /api/appointments
 */
export const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointment =
      await createAppointment(
        req.user.userId,
        {
          barberId: req.body.barberId,
          careBarberId: req.body.careBarberId,
          serviceIds: req.body.serviceIds,
          appointmentDate:
            req.body.appointmentDate,
          startTime: req.body.startTime,
          note: req.body.note,
          customer: req.body.customer,
          voucherCode: req.body.voucherCode,
        }
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
 * CLIENT xem lịch của mình
 * GET /api/appointments/my
 */
export const getMine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointments =
      await getMyAppointments(
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
 * CLIENT hủy lịch của mình
 * PATCH /api/appointments/:id/cancel
 */
export const cancelMine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointmentId =
      getStringParam(
        req.params.id,
        "Mã lịch hẹn không hợp lệ"
      );

    const appointment =
      await cancelMyAppointment({
        appointmentId,
        userId: req.user.userId,
        role: "CLIENT",
        reason: req.body.reason,
        refundBankName: req.body.refundBankName,
        refundAccountNumber: req.body.refundAccountNumber,
        refundAccountName: req.body.refundAccountName,
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

/** CLIENT đổi thời gian lịch hẹn. */
export const rescheduleMine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);

    const appointment = await rescheduleMyAppointment({
      appointmentId: getStringParam(req.params.id, "Mã lịch hẹn không hợp lệ"),
      clientId: req.user.userId,
      appointmentDate: req.body.appointmentDate,
      startTime: req.body.startTime,
    });

    res.status(200).json({
      success: true,
      message: "Đổi thời gian lịch hẹn thành công",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * BARBER xem lịch của chính mình
 * GET /api/barber/appointments
 */
export const getBarberMine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointments =
      await getBarberAppointments(
        req.user.userId,
        {
          status: req.query
            .status as
            | AppointmentStatus
            | undefined,

          appointmentDate:
            typeof req.query
              .appointmentDate ===
            "string"
              ? req.query.appointmentDate
              : undefined,

          dateFrom:
            typeof req.query.dateFrom ===
            "string"
              ? req.query.dateFrom
              : undefined,

          dateTo:
            typeof req.query.dateTo ===
            "string"
              ? req.query.dateTo
              : undefined,
        }
      );

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const markBarberViewed = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const appointment = await markBarberAppointmentViewed(
      getStringParam(req.params.id, "Mã lịch hẹn không hợp lệ"),
      req.user.userId
    );
    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * BARBER cập nhật trạng thái lịch
 * PATCH /api/barber/appointments/:id/status
 */
export const updateBarberStatus = async (
  _req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    throw new AppError(
      "Barber chỉ có quyền xem lịch làm việc",
      403
    );
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN xem toàn bộ lịch hẹn
 * GET /api/admin/appointments
 */
export const getAdminAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointments =
      await getAdminAppointments({
        status: req.query
          .status as
          | AppointmentStatus
          | undefined,

        appointmentDate:
          typeof req.query
            .appointmentDate ===
          "string"
            ? req.query.appointmentDate
            : undefined,

        dateFrom:
          typeof req.query.dateFrom ===
          "string"
            ? req.query.dateFrom
            : undefined,

        dateTo:
          typeof req.query.dateTo ===
          "string"
            ? req.query.dateTo
            : undefined,

        barberId:
          typeof req.query.barberId ===
          "string"
            ? req.query.barberId
            : undefined,

        clientId:
          typeof req.query.clientId ===
          "string"
            ? req.query.clientId
            : undefined,
      });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN cập nhật trạng thái lịch
 * PATCH /api/admin/appointments/:id/status
 */
export const updateAdminStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        "Bạn chưa đăng nhập",
        401
      );
    }

    const appointmentId =
      getStringParam(
        req.params.id,
        "Mã lịch hẹn không hợp lệ"
      );

    const status =
      req.body.status as
        | AppointmentStatus
        | undefined;

    if (!status) {
      throw new AppError(
        "Trạng thái là bắt buộc",
        400
      );
    }

    const appointment =
      await updateAppointmentStatus({
        appointmentId,
        actorId: req.user.userId,
        actorRole: "ADMIN",
        status,
        reason: req.body.reason,
      });

    res.status(200).json({
      success: true,
      message:
        "Admin cập nhật trạng thái thành công",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CLIENT xem khung giờ trống
 * GET /api/appointments/available-slots
 *
 * Query:
 * barberId
 * appointmentDate
 * serviceIds=id1,id2,id3
 */
export const getSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId =
      typeof req.query.barberId ===
      "string"
        ? req.query.barberId
        : "";

    const appointmentDate =
      typeof req.query
        .appointmentDate ===
      "string"
        ? req.query.appointmentDate
        : "";

    const serviceIdsRaw =
      typeof req.query.serviceIds ===
      "string"
        ? req.query.serviceIds
        : "";

    const serviceIds =
      serviceIdsRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    const slots =
      await getAvailableSlots({
        barberId,
        serviceIds,
        appointmentDate,
      });

    res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    next(error);
  }
};
