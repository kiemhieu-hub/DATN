import type { NextFunction, Request, Response } from "express";

import * as service from "../services/adminContent.service";

const id = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const respondList = async (
  action: () => Promise<unknown>,
  res: Response,
  next: NextFunction
) => {
  try { res.json({ success: true, items: await action() }); }
  catch (error) { next(error); }
};

const respondDelete = async (
  action: () => Promise<unknown>,
  message: string,
  res: Response,
  next: NextFunction
) => {
  try { res.json({ success: true, message, item: await action() }); }
  catch (error) { next(error); }
};

export const getVouchers = (_req: Request, res: Response, next: NextFunction) =>
  respondList(service.listVouchers, res, next);
export const removeVoucher = (req: Request, res: Response, next: NextFunction) =>
  respondDelete(() => service.deleteVoucher(id(req.params.id)), "Xóa voucher thành công", res, next);

export const getReviews = (_req: Request, res: Response, next: NextFunction) =>
  respondList(service.listReviews, res, next);
export const removeReview = (req: Request, res: Response, next: NextFunction) =>
  respondDelete(() => service.deleteReview(id(req.params.id)), "Xóa review thành công", res, next);

export const getServiceCategories = (_req: Request, res: Response, next: NextFunction) =>
  respondList(service.listServiceCategories, res, next);
export const removeServiceCategory = (req: Request, res: Response, next: NextFunction) =>
  respondDelete(() => service.deleteServiceCategory(id(req.params.id)), "Xóa danh mục thành công", res, next);

export const getHairstyles = (_req: Request, res: Response, next: NextFunction) =>
  respondList(service.listHairstyles, res, next);
export const removeHairstyle = (req: Request, res: Response, next: NextFunction) =>
  respondDelete(() => service.deleteHairstyle(id(req.params.id)), "Xóa hình ảnh thành công", res, next);
