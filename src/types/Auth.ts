export type UserRole = "CLIENT" | "BARBER" | "RECEPTIONIST" | "ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}
