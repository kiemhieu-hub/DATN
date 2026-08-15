import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import AppError from "../utils/AppError";
import { listRefunds, processRefund } from "../services/refund.service";

const param = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const getRefunds = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ success: true, refunds: await listRefunds() });
  } catch (error) {
    next(error);
  }
};

export const updateRefund = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const refund = await processRefund({
      refundId: param(req.params.id),
      actorId: req.user.userId,
      actorRole: req.user.role as "ADMIN" | "RECEPTIONIST",
      status: req.body.status,
      bankReference: req.body.bankReference,
      proofImage: req.body.proofImage,
      failureReason: req.body.failureReason,
    });
    res.json({ success: true, message: "Cập nhật hoàn tiền thành công", refund });
  } catch (error) {
    next(error);
  }
};

