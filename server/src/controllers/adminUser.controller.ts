import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { UserStatus, UserRole } from "../models/User";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import AppError from "../utils/AppError";
import {
  getAdminClientById,
  getAdminClients,
  updateAdminClientStatus,
  updateAdminUserRole,
  deleteAdminUser,
} from "../services/adminUser.service";

const getId = (
  value: string | string[] | undefined
): string => {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
};

export const deleteClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
    const client = await deleteAdminUser(getId(req.params.id), req.user.userId);
    res.status(200).json({ success: true, message: "Xóa người dùng thành công", client });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getAdminClients({
      keyword:
        typeof req.query.keyword === "string"
          ? req.query.keyword
          : undefined,
      status:
        typeof req.query.status === "string"
          ? (req.query.status as UserStatus | "ALL")
          : undefined,
      role:
        typeof req.query.role === "string"
          ? (req.query.role as UserRole | "ALL")
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

export const getClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await getAdminClientById(
      getId(req.params.id)
    );

    res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClientStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Bạn chưa đăng nhập", 401);
    }

    const client = await updateAdminClientStatus(
      getId(req.params.id),
      req.body.status,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái người dùng thành công",
      client,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Bạn chưa đăng nhập", 401);
    }

    const user = await updateAdminUserRole(
      getId(req.params.id),
      req.body.role,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật vai trò người dùng thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};