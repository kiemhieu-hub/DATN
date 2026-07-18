import type {
  CatalogService,
} from "./Catalog";

export interface BarberProfileAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  role: "BARBER";
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarberProfileDetail {
  id: string;
  bio: string;
  avatar: string;
  experienceYears: number;
  averageRating: number;
  reviewCount: number;
  specialties: CatalogService[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BarberProfileData {
  account: BarberProfileAccount;
  profile: BarberProfileDetail;
}

export interface GetBarberProfileResponse {
  success: boolean;
  data: BarberProfileData;
}

export interface UpdateBarberProfilePayload {
  fullName: string;
  phone: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  specialtyIds: string[];
}

export interface UpdateBarberProfileResponse {
  success: boolean;
  message: string;
  data: BarberProfileData;
}