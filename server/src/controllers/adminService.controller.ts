import type { NextFunction, Request, Response } from "express";
import type { ServiceGroup } from "../models/Service";
import * as service from "../services/adminService.service";

const param = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAdminServices({
      keyword: typeof req.query.keyword === "string" ? req.query.keyword : undefined,
      group: typeof req.query.group === "string" ? req.query.group as ServiceGroup | "ALL" : undefined,
      status: typeof req.query.status === "string" ? req.query.status as "ACTIVE" | "INACTIVE" | "ALL" : undefined,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const getService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.getAdminServiceById(param(req.params.id));
    res.json({ success: true, service: item });
  } catch (error) { next(error); }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.createAdminService(req.body);
    res.status(201).json({ success: true, message: "Thêm dịch vụ thành công", service: item });
  } catch (error) { next(error); }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.updateAdminService(param(req.params.id), req.body);
    res.json({ success: true, message: "Cập nhật dịch vụ thành công", service: item });
  } catch (error) { next(error); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.updateAdminServiceStatus(param(req.params.id), req.body.isActive);
    res.json({ success: true, message: item.isActive ? "Đã bật dịch vụ" : "Đã tạm ngừng dịch vụ", service: item });
  } catch (error) { next(error); }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.deleteAdminService(param(req.params.id));
    res.json({ success: true, message: "Xóa dịch vụ thành công", service: item });
  } catch (error) { next(error); }
};
