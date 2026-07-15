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
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập",
    });
    return;
  }

  const token = authorization.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
    return;
  }

  try {
    req.user = jwt.verify(token, secret) as TokenPayload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};