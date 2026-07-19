import api from "./api";
import type {AuthUser,LoginPayload,LoginResponse,RegisterPayload,RegisterResponse,} from "../types/Auth";

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
  data: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get<{
    success: boolean;
    user: AuthUser;
  }>("/auth/me");

  return response.data.user;
};