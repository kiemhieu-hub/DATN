import {
  type NextFunction,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";

import * as adminDashboardService from "../services/adminDashboard.service";

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });

      return;
    }

    const dashboard =
      await adminDashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};