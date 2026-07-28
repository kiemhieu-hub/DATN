import type { Appointment } from "./Appoinment";

export type AdminUserRole =
  | "CLIENT"
  | "BARBER"
  | "RECEPTIONIST"
  | "ADMIN";

export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  totalAppointments: number;
  completedAppointments?: number;
  lastAppointmentDate?: string | null;
  totalSpent: number;
}

export interface AdminUserDetail extends AdminUser {
  recentAppointments: Appointment[];
  barberProfile?: {
    bio: string;
    experienceYears: number;
    averageRating: number;
    reviewCount: number;
    isActive: boolean;
    specialties: Array<{
      _id: string;
      name: string;
      price: number;
      durationMinutes: number;
      group: string;
      isActive: boolean;
    }>;
  } | null;
}

export interface AdminUserSummary {
  totalUsers: number;
  totalClients: number;
  totalBarbers: number;
  totalReceptionists?: number;
  totalAdmins: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAdminUsersParams {
  keyword?: string;
  role?: AdminUserRole | "ALL";
  status?: AdminUserStatus | "ALL";
  page?: number;
  limit?: number;
}

export interface GetAdminUsersResponse {
  success: boolean;
  items: AdminUser[];
  summary: AdminUserSummary;
  pagination: AdminUserPagination;
}

export interface GetAdminUserResponse {
  success: boolean;
  client: AdminUserDetail;
}

export interface UpdateAdminUserStatusResponse {
  success: boolean;
  message: string;
  client: AdminUser;
}
