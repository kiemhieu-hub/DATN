import api from "./api";
import type { Voucher, VoucherPayload } from "../types/Voucher";

interface ListResponse {
  success: boolean;
  items: Voucher[];
}

interface MutationResponse {
  success: boolean;
  message: string;
  voucher: Voucher;
}

export const getAdminVouchers = async () =>
  (await api.get<ListResponse>("/admin/vouchers")).data;

export const createAdminVoucher = async (payload: VoucherPayload) =>
  (await api.post<MutationResponse>("/admin/vouchers", payload)).data;

export const updateAdminVoucher = async (id: string, payload: VoucherPayload) =>
  (await api.put<MutationResponse>(`/admin/vouchers/${id}`, payload)).data;

export const updateAdminVoucherStatus = async (id: string, isActive: boolean) =>
  (await api.patch<MutationResponse>(`/admin/vouchers/${id}/status`, { isActive })).data;

export const deleteAdminVoucher = async (id: string) =>
  (await api.delete<{ success: boolean; message: string }>(`/admin/vouchers/${id}`)).data;
