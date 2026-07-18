import type {
  CatalogService,
} from "./Catalog";

export type AdminBarberStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

export interface AdminBarberProfile {
  id: string;
  bio: string;
  avatar: string;
  experienceYears: number;
  averageRating: number;
  reviewCount: number;
  specialties: CatalogService[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBarber {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  role?: "BARBER";
  status: AdminBarberStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile: AdminBarberProfile | null;
}

export interface AdminBarberPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAdminBarbersParams {
  keyword?: string;
  status?:
    | AdminBarberStatus
    | "ALL";
  page?: number;
  limit?: number;
}

export interface GetAdminBarbersResponse {
  success: boolean;
  items: AdminBarber[];
  pagination: AdminBarberPagination;
}

export interface GetAdminBarberResponse {
  success: boolean;
  barber: AdminBarber;
}

export interface CreateAdminBarberPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  specialtyIds?: string[];
}

export interface UpdateAdminBarberPayload {
  fullName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  specialtyIds?: string[];
}

export interface UpdateAdminBarberStatusPayload {
  status: AdminBarberStatus;
}

export interface ResetAdminBarberPasswordPayload {
  newPassword: string;
}

export interface AdminBarberMutationResponse {
  success: boolean;
  message: string;
  barber: AdminBarber;
}

export interface ResetAdminBarberPasswordResponse {
  success: boolean;
  message: string;
  barber: {
    id: string;
    fullName: string;
    email: string;
  };
}