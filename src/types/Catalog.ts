export type ServiceGroup =| "HAIRCUT"| "BEARD"| "COLOR"| "CARE"| "OTHER";
export type ServiceStaffType = "HAIR" | "CARE";
export interface CatalogService {
  id: string;
  name: string;
  description: string;

  price: number;
  priceFrom: boolean;

  durationMinutes: number;

  group: ServiceGroup;
  isExclusiveInGroup: boolean;
  staffType: ServiceStaffType;

  image: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
  } | null;
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
  staffType: ServiceStaffType;
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
