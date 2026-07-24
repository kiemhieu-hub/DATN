import bcrypt from "bcrypt";

import User from "../models/User";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/generateToken";
import { sendResetPasswordEmail } from "./email.service";

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginInput {
  emailOrPhone: string;
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

  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existingUser) {
    throw new AppError("Email đã được sử dụng", 409);
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
  const { emailOrPhone, password } = input;

  if (!emailOrPhone || !password) {
    throw new AppError("Vui lòng nhập email/số điện thoại và mật khẩu", 400);
  }

  // Check if input is email or phone
  const isEmail = emailOrPhone.includes("@");
  const normalizedInput = isEmail
    ? emailOrPhone.toLowerCase().trim()
    : emailOrPhone.trim();

  const user = await User.findOne(
    isEmail
      ? { email: normalizedInput }
      : { phone: normalizedInput }
  ).select("+password");

  if (!user) {
    throw new AppError("Email hoặc số điện thoại không tồn tại trong hệ thống", 401);
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
    throw new AppError("Mật khẩu không chính xác", 401);
  }

  const accessToken = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

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
    role: user.role,
    status: user.status,
  };
};

interface ForgotPasswordInput {
  email: string;
}

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const { email } = input;

  if (!email) {
    throw new AppError("Email là bắt buộc", 400);
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu sẽ được gửi." };
  }

  // Generate reset token (random hex string)
  const crypto = await import("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and save to DB (expires in 1 hour)
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  // Send reset email
  const { CLIENT_URL } = process.env;
  const resetUrl = `${CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  await sendResetPasswordEmail({
    to: user.email,
    customerName: user.fullName,
    resetUrl,
  });

  return {
    message: "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu sẽ được gửi.",
  };
};

interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export const resetPassword = async (input: ResetPasswordInput) => {
  const { token, password, confirmPassword } = input;

  if (!token || !password || !confirmPassword) {
    throw new AppError("Token, mật khẩu và xác nhận mật khẩu là bắt buộc", 400);
  }

  if (password !== confirmPassword) {
    throw new AppError("Mật khẩu xác nhận không khớp", 400);
  }

  if (password.length < 6) {
    throw new AppError("Mật khẩu phải có ít nhất 6 ký tự", 400);
  }

  // Hash the token to compare with stored hash
  const crypto = await import("crypto");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token (not expired)
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400);
  }

  // Update password
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  return { message: "Mật khẩu đã được đặt lại thành công" };
};
