import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import { evaluateVoucherFromServiceIds } from "../services/voucher.service";
import AppError from "../utils/AppError";

export const validateVoucher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);

    const calculation = await evaluateVoucherFromServiceIds(
      req.body.code,
      req.user.userId,
      req.body.serviceIds,
      Array.isArray(req.body.barberIds) ? req.body.barberIds : []
    );

    res.status(200).json({
      success: true,
      message: `Áp dụng voucher ${calculation.code} thành công`,
      calculation,
    });
  } catch (error) {
    next(error);
  }
};
