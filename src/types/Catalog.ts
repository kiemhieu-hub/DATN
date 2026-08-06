export type ServiceGroup =
  | "HAIRCUT"
  | "BEARD"
  | "COLOR"
  | "CARE"
  | "OTHER";

export interface CatalogService {
  id: string;
  name: string;
  description: string;

  price: number;
  priceFrom: boolean;

  durationMinutes: number;

  group: ServiceGroup;
  isExclusiveInGroup: boolean;

  image: string;
  isActive: boolean;
}

export interface BarberSpecialty {
  _id: string;
  name: string;
  price: number;
  durationMinutes: number;
  group: ServiceGroup;
  image: string;
}

export interface BarberProfile {
  bio: string;
  avatar: string;
  experienceYears: number;
  averageRating: number;
  reviewCount: number;
  specialties: BarberSpecialty[];
}

export interface CatalogBarber {
  id: string;
  fullName: string;
  email: string;
  phone: string;

  role: "BARBER";
  status: string;

  profile: BarberProfile;
}

export interface GetServicesResponse {
  success: boolean;
  services: CatalogService[];
}

export interface GetBarbersResponse {
  success: boolean;
  barbers: CatalogBarber[];
}

export interface GetBarberDetailResponse {
  success: boolean;
  barber: CatalogBarber;
}