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
import type { UserRole } from "../models/User";

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

const loginByRole = (expectedRole: UserRole) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginUser(req.body, expectedRole);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginClient = loginByRole("CLIENT");
export const loginBarber = loginByRole("BARBER");
export const loginReceptionist = loginByRole("RECEPTIONIST");
export const loginAdmin = loginByRole("ADMIN");

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
