import api from "./api";
import axios from "axios";
import type {AuthUser,LoginPayload,LoginResponse,RegisterPayload,RegisterResponse,UserRole,} from "../types/Auth";

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
  }>("http://localhost:5000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.user;
};