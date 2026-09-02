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
  updateClientProfile,
  requestPasswordReset,
  resetPassword,
  changePassword,
  revokeSessions,
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

export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await updateClientProfile(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await requestPasswordReset(String(req.body.email || ""));
    res.json({ success: true, message: "Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu." });
  } catch (error) { next(error); }
};

export const applyPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await resetPassword(String(req.body.token || ""), String(req.body.password || ""), String(req.body.confirmPassword || ""));
    res.json({ success: true, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (error) { next(error); }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await changePassword(req.user!.userId, String(req.body.currentPassword || ""), String(req.body.newPassword || ""), String(req.body.confirmPassword || ""));
    res.json({ success: true, message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (error) { next(error); }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try { await revokeSessions(req.user!.userId); res.json({ success: true, message: "Đăng xuất thành công" }); }
  catch (error) { next(error); }
};
