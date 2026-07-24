import api from "./api";
import type { ServiceCategory, ServiceCategoryPayload } from "../types/ServiceCategory";

interface ListResponse {
    success: boolean;
    items: ServiceCategory[];
}

interface MutationResponse {
    success: boolean;
    message: string;
    category: ServiceCategory;
}

export const getAdminServiceCategories = async () =>
    (await api.get<ListResponse>("/admin/service-categories")).data;

export const createAdminServiceCategory = async (payload: ServiceCategoryPayload) =>
    (await api.post<MutationResponse>("/admin/service-categories", payload)).data;

export const updateAdminServiceCategory = async (id: string, payload: ServiceCategoryPayload) =>
    (await api.put<MutationResponse>(`/admin/service-categories/${id}`, payload)).data;

export const updateAdminServiceCategoryStatus = async (id: string, isActive: boolean) =>
    (await api.patch<MutationResponse>(`/admin/service-categories/${id}/status`, { isActive })).data;

export const deleteAdminServiceCategory = async (id: string) =>
    (await api.delete<{ success: boolean; message: string }>(`/admin/service-categories/${id}`)).data;
