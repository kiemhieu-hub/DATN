import type { NextFunction, Request, Response } from "express";
import * as service from "../services/adminHairstyleGallery.service";

const id = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const getHairstyles = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, items: await service.getAdminHairstyles() }); }
    catch (error) { next(error); }
};

export const createHairstyle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await service.createAdminHairstyle(req.body);
        res.status(201).json({ success: true, message: "Thêm hình ảnh thành công", item });
    }catch (error) { next(error); }
};

export const updateHairstyle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await service.updateAdminHairstyle(id(req.params.id), req.body);
        res.json({ success: true, message: "Cập nhật hình ảnh thành công", item });
    }catch (error) { next(error); }
};

export const updateHairstyleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await service.updateAdminHairstyleStatus(id(req.params.id), req.body.isActive);
        res.json({ success: true, message: item.isActive ? "Đã hiển thị hình ảnh" : "Đã ẩn hình ảnh", item });
    } catch (error) { next(error); }
};

export const deleteHairstyle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await service.deleteAdminHairstyle(id(req.params.id));
        res.json({ success: true, message: "Xóa hình ảnh thành công", item });
        } catch (error) { next(error); }
}