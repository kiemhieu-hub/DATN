import api from "./api";
import type { AdminServiceMutationResponse, AdminServicePayload, GetAdminServicesResponse } from "../types/AdminService";
import type { ServiceGroup } from "../types/Catalog";

export interface AdminServiceParams {
  keyword?: string;
  group?: ServiceGroup | "ALL";
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  page?: number;
  limit?: number;
}

export const getAdminServices = async (params: AdminServiceParams = {}) =>
  (await api.get<GetAdminServicesResponse>("/admin/services", { params })).data;

export const createAdminService = async (payload: AdminServicePayload) =>
  (await api.post<AdminServiceMutationResponse>("/admin/services", payload)).data;

export const updateAdminService = async (id: string, payload: AdminServicePayload) =>
  (await api.put<AdminServiceMutationResponse>(`/admin/services/${id}`, payload)).data;

export const updateAdminServiceStatus = async (id: string, isActive: boolean) =>
  (await api.patch<AdminServiceMutationResponse>(`/admin/services/${id}/status`, { isActive })).data;

export const deleteAdminService = async (id: string) =>
  (await api.delete<{ success: boolean; message: string }>(`/admin/services/${id}`)).data;
