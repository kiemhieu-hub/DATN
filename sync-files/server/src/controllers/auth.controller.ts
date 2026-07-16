import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import {
  getCurrentUser,
  loginUser,
  registerClient,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await registerClient(req.body);

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getCurrentUser(req.user!.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};