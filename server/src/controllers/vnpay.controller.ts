import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import AppError from "../utils/AppError";
import {
  createVnpayPayment,
  getClientVnpayPaymentStatus,
  processVnpayCallback,
} from "../services/vnpay.service";

const queryToRecord = (query: Request["query"]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(query)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );

const param = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const createPaymentUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const purpose = req.body.purpose;
    if (!["DEPOSIT", "BALANCE"].includes(purpose)) {
      throw new AppError("Mục đích thanh toán không hợp lệ", 400);
    }
    const result = await createVnpayPayment({
      appointmentId: req.body.appointmentId,
      clientId: req.user.userId,
      purpose,
      ipAddress: req.ip || req.socket.remoteAddress || "127.0.0.1",
    });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const vnpayReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await processVnpayCallback(queryToRecord(req.query));
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

export const vnpayIpn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await processVnpayCallback(queryToRecord(req.query));
    res.status(200).json({ RspCode: result.rspCode, Message: result.message });
  } catch (error) {
    console.error("VNPay IPN error:", error);
    res.status(200).json({ RspCode: "99", Message: "Lỗi không xác định" });
  }
};

export const getPaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const payment = await getClientVnpayPaymentStatus(
      param(req.params.transactionCode),
      req.user.userId
    );
    res.status(200).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};
