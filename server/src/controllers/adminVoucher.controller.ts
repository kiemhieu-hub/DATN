import type { NextFunction, Request, Response } from "express";
import {createAdminVoucher,deleteAdminVoucher,getAdminVouchers,updateAdminVoucher,updateAdminVoucherStatus,} from "../services/adminVoucher.service";
import AppError from "../utils/AppError";

const routeId = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

export const getVouchers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, items: await getAdminVouchers() });
  } catch (error) { next(error); }
};

export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voucher = await createAdminVoucher(req.body);
    res.status(201).json({ success: true, message: "Tạo voucher thành công", voucher });
  } catch (error) { next(error); }
};

export const updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voucher = await updateAdminVoucher(routeId(req.params.id), req.body);
    res.json({ success: true, message: "Cập nhật voucher thành công", voucher });
  } catch (error) { next(error); }
};

export const changeVoucherStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body.isActive !== "boolean") {
      throw new AppError("Trạng thái voucher không hợp lệ", 400);
    }
    const voucher = await updateAdminVoucherStatus(
      routeId(req.params.id),
      req.body.isActive
    );
    res.json({ success: true, message: "Cập nhật trạng thái thành công", voucher });
  } catch (error) { next(error); }
};

export const removeVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voucher = await deleteAdminVoucher(routeId(req.params.id));
    res.json({ success: true, message: "Xóa voucher thành công", voucher });
  } catch (error) { next(error); }
};
