import type {
  NextFunction,
  Response,
} from "express";

import type { UserRole } from "../models/User";
import type { AuthenticatedRequest } from "./authenticate";

export const authorize = (
  ...allowedRoles: UserRole[]
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
      return;
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền truy cập chức năng này",
      });
      return;
    }

    next();
  };
};