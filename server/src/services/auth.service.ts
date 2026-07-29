import bcrypt from "bcrypt";

import User from "../models/User";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/generateToken";

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
  const { email, password } = input;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

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
    role: user.role ,
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
