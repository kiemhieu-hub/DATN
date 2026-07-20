import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import {
  confirmCashPayment,
  getPaymentByAppointment,
  getAdminPayments,
  getAdminPaymentById,
  deleteAdminPayment,
} from "../services/payment.service";
import AppError from "../utils/AppError";

const getAppointmentId = (
  value: string | string[] | undefined
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export const deletePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] ?? "" : req.params.id ?? "";
    const payment = await deleteAdminPayment(paymentId);
    res.status(200).json({ success: true, message: "Xóa hóa đơn thành công", payment });
  } catch (error) {
    next(error);
  }
};

export const payCash = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Bạn chưa đăng nhập", 401);
    }

    const result = await confirmCashPayment(
      getAppointmentId(req.params.appointmentId),
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: "Xác nhận thanh toán tiền mặt thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const payBankTransfer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const result = await confirmCashPayment(
      getAppointmentId(req.params.appointmentId),
      req.user.userId,
      "BANK_TRANSFER"
    );
    res.status(201).json({ success: true, message: "Xác nhận chuyển khoản thành công", ...result });
  } catch (error) { next(error); }
};

export const getByAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await getPaymentByAppointment(
      getAppointmentId(req.params.appointmentId)
    );

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getAdminPayments({
      keyword:
        typeof req.query.keyword === "string"
          ? req.query.keyword
          : undefined,
      status:
        typeof req.query.status === "string"
          ? (req.query.status as any)
          : undefined,
      method:
        typeof req.query.method === "string"
          ? (req.query.method as any)
          : undefined,
      dateFrom:
        typeof req.query.dateFrom === "string"
          ? req.query.dateFrom
          : undefined,
      dateTo:
        typeof req.query.dateTo === "string"
          ? req.query.dateTo
          : undefined,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentDetail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paymentId = Array.isArray(req.params.id)
      ? req.params.id[0] ?? ""
      : req.params.id ?? "";

    const payment = await getAdminPaymentById(paymentId);

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
