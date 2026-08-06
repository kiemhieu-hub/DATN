import api from "./api";
import type { HairstyleGalleryItem, HairstyleGalleryPayload } from "../types/HairstyleGallery";

interface ListResponse { success: boolean; items: HairstyleGalleryItem[]; }
interface MutationResponse { success: boolean; message: string; item: HairstyleGalleryItem; }

export const getAdminHairstyles = async () =>
    (await api.get<ListResponse>("/admin/hairstyle-gallery")).data;

export const createAdminHairstyle = async (payload: HairstyleGalleryPayload) =>
    (await api.post<MutationResponse>("/admin/hairstyle-gallery", payload)).data;

export const updateAdminHairstyle = async (id: string, payload: HairstyleGalleryPayload) =>
    (await api.put<MutationResponse>(`/admin/hairstyle-gallery/${id}`, payload)).data;

export const updateAdminHairstyleStatus = async (id: string, isActive: boolean) =>
    (await api.patch<MutationResponse>(`/admin/hairstyle-gallery/${id}/status`, { isActive })).data;

export const deleteAdminHairstyle = async (id: string) =>
    (await api.delete<{ success: boolean; message: string }>(`/admin/hairstyle-gallery/${id}`)).data;
