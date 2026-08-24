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
