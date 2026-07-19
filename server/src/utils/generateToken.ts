import jwt, { type SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  role: "CLIENT" | "BARBER" | "ADMIN";
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET chưa được cấu hình");
  }

  const expiresIn =
    (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};