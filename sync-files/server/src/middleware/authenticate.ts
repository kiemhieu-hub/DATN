import {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import jwt from "jsonwebtoken";

import type { TokenPayload } from "../utils/generateToken";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập",
    });
    return;
  }

  const token =
    authorization.split(" ")[1];

  const secret =
    process.env.JWT_SECRET;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
    return;
  }

  if (!secret) {
    console.error(
      "JWT_SECRET chưa được cấu hình trong file .env"
    );

    res.status(500).json({
      success: false,
      message: "Lỗi cấu hình máy chủ",
    });
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      secret
    ) as TokenPayload;

    req.user = payload;

    next();
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        success: false,
        message:
          "Phiên đăng nhập đã hết hạn",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};