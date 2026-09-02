import api from "./api";
import axios from "axios";
import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse, UpdateProfilePayload, UserRole } from "../types/Auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const register = async (
  data: RegisterPayload
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

export const login = async (
  data: LoginPayload,
  role: UserRole
): Promise<LoginResponse> => {
  const rolePath = role.toLowerCase();
  const response = await api.post<LoginResponse>(
    `/auth/${rolePath}/login`,
    data
  );

  return response.data;
};

export const getMe = async (
  accessToken: string
): Promise<AuthUser> => {
  const response = await axios.get<{
    success: boolean;
    user: AuthUser;
  }>(`${API_URL}/auth/me`, {
    timeout: 10_000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.user;
};

export const updateMyProfile = async (data: UpdateProfilePayload) => {
  const response = await api.patch<{
    success: boolean;
    message: string;
    user: AuthUser;
  }>("/auth/me", data);
  return response.data;
};

export const forgotPassword = async (email: string) => (await api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email })).data;
export const resetPassword = async (token: string, password: string, confirmPassword: string) => (await api.post<{ success: boolean; message: string }>("/auth/reset-password", { token, password, confirmPassword })).data;
export const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => (await api.patch<{ success: boolean; message: string }>("/auth/change-password", { currentPassword, newPassword, confirmPassword })).data;
export const revokeCurrentSession = async () => { await api.post("/auth/logout"); };
