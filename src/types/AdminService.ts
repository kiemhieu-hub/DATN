import type { ServiceGroup } from "./Catalog";

export interface AdminService {
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
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  } | null;
}

export interface AdminServicePayload {
  name: string;
  description: string;
  price: number;
  priceFrom: boolean;
  durationMinutes: number;
  group: ServiceGroup;
  image: string;
  isActive: boolean;
  categoryId: string;
}

export interface AdminServicePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAdminServicesResponse {
  success: boolean;
  items: AdminService[];
  pagination: AdminServicePagination;
}

export interface AdminServiceMutationResponse {
  success: boolean;
  message: string;
  service: AdminService;
}
