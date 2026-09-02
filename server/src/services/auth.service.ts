import bcrypt from "bcrypt";
import crypto from "node:crypto";

import User from "../models/User";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/generateToken";
import { sendPasswordResetEmail } from "./email.service";

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginInput {
  email: string;
  password: string;
}

type UserRole = "CLIENT" | "BARBER" | "RECEPTIONIST" | "ADMIN";

export const registerClient = async (input: RegisterInput) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
  } = input;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    throw new AppError("Vui lòng nhập đầy đủ thông tin", 400);
  }

  if (password !== confirmPassword) {
    throw new AppError("Mật khẩu xác nhận không khớp", 400);
  }
  assertPassword(password);

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
  });

  if (existingUser) {
    throw new AppError(existingUser.email === email.toLowerCase().trim() ? "Email đã được sử dụng" : "Số điện thoại đã được sử dụng", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
    role: "CLIENT",
    status: "ACTIVE",
  });

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
};

export const loginUser = async (
  input: LoginInput,
  expectedRole: UserRole
) => {
  const { email, password } = input;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password +tokenVersion");

  if (!user) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  if (user.role !== expectedRole) {
    throw new AppError(
      `Tài khoản này không thuộc quyền ${expectedRole}`,
      403
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Tài khoản hiện không hoạt động", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  const accessToken = generateToken({
    userId: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
};

function assertPassword(password: string): void {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số", 400);
  }
}

export const requestPasswordReset = async (emailValue: string): Promise<void> => {
  const email = emailValue?.trim().toLowerCase();
  if (!email) throw new AppError("Vui lòng nhập email", 400);
  const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
  if (!user) return;
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  await sendPasswordResetEmail(user.email, user.fullName, `${clientUrl}/reset-password?token=${rawToken}`);
};

export const resetPassword = async (rawToken: string, password: string, confirmPassword: string): Promise<void> => {
  if (!rawToken) throw new AppError("Liên kết đặt lại mật khẩu không hợp lệ", 400);
  if (password !== confirmPassword) throw new AppError("Mật khẩu xác nhận không khớp", 400);
  assertPassword(password);
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: new Date() } }).select("+password +resetPasswordToken +resetPasswordExpires +tokenVersion");
  if (!user) throw new AppError("Liên kết đã hết hạn hoặc không hợp lệ", 400);
  user.password = await bcrypt.hash(password, 10);
  user.passwordChangedAt = new Date();
  user.resetPasswordToken = "";
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1;
  await user.save();
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
  if (newPassword !== confirmPassword) throw new AppError("Mật khẩu xác nhận không khớp", 400);
  assertPassword(newPassword);
  const user = await User.findById(userId).select("+password +tokenVersion");
  if (!user) throw new AppError("Không tìm thấy tài khoản", 404);
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new AppError("Mật khẩu hiện tại không chính xác", 400);
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date();
  user.tokenVersion += 1;
  await user.save();
};

export const revokeSessions = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("Không tìm thấy tài khoản", 404);
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
  };
};

interface UpdateClientProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export const updateClientProfile = async (
  userId: string,
  input: UpdateClientProfileInput
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("Không tìm thấy tài khoản", 404);
  }

  if (user.role !== "CLIENT") {
    throw new AppError("Chỉ khách hàng được cập nhật hồ sơ tại đây", 403);
  }

  if (typeof input.fullName === "string") {
    user.fullName = input.fullName.trim();
  }

  if (typeof input.phone === "string") {
    user.phone = input.phone.trim();
  }

  if (typeof input.avatar === "string") {
    user.avatar = input.avatar.trim();
  }

  await user.save();
  return getCurrentUser(userId);
};
