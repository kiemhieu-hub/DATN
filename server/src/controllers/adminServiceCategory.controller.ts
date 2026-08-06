import type { NextFunction, Request, Response } from "express";
import * as service from "../services/adminServiceCategory.service";

const id = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, items: await service.getAdminServiceCategories() }); }
  catch (error) { next(error); }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.createAdminServiceCategory(req.body);
    res.status(201).json({ success: true, message: "Thêm danh mục thành công", category });
    } catch (error) { next(error); }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await service.createAdminServiceCategory(req.body);
        res.status(201).json({ success: true, message: "Thêm danh mục thành công", category });
    }catch (error) { next(error); }
}

export const updateCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.updateAdminServiceCategoryStatus(
      id(req.params.id),
      req.body.isActive
    );
    res.json({ success: true, message: category.isActive ? "Đã mở danh mục" : "Đã khóa danh mục", category });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.deleteAdminServiceCategory(id(req.params.id));
    res.json({ success: true, message: "Xóa danh mục thành công", category });
    } catch (error) { next(error); }
};
