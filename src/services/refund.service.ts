import api from "./api";
import type { Refund, RefundStatus } from "../types/Refund";

export const getRefunds = async () =>
  (await api.get<{ success: boolean; refunds: Refund[] }>("/admin/refunds")).data;

export const processRefund = async (
  id: string,
  payload: {
    status: Extract<RefundStatus, "REFUNDED_MANUAL" | "FAILED">;
    bankReference?: string;
    proofImage?: string;
    failureReason?: string;
  }
) => (await api.patch<{ success: boolean; refund: Refund; message: string }>(`/admin/refunds/${id}`, payload)).data;
