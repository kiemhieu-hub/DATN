import api from "./api";

import type {
  ConfirmCashPaymentResponse,
  GetPaymentResponse,
  GetPaymentsParams,
  GetPaymentsResponse,
} from "../types/Payment";

export const confirmCashPayment = async (
  appointmentId: string
): Promise<ConfirmCashPaymentResponse> => {
  const response =
    await api.post<ConfirmCashPaymentResponse>(
      `/admin/payments/appointments/${appointmentId}/cash`
    );

  return response.data;
};

export const confirmBankTransfer = async (
  appointmentId: string
): Promise<ConfirmCashPaymentResponse> => {
  const response = await api.post<ConfirmCashPaymentResponse>(
    `/admin/payments/appointments/${appointmentId}/bank-transfer`
  );
  return response.data;
};

export const getAdminPayments = async (
  params: GetPaymentsParams = {}
): Promise<GetPaymentsResponse> => {
  const response = await api.get<GetPaymentsResponse>(
    "/admin/payments",
    {
      params,
    }
  );

  return response.data;
};

export const getAdminPaymentById = async (
  paymentId: string
): Promise<GetPaymentResponse> => {
  const response = await api.get<GetPaymentResponse>(
    `/admin/payments/${paymentId}`
  );

  return response.data;
};

export const deleteAdminPayment = async (paymentId: string) =>
  (await api.delete<{ success: boolean; message: string }>(`/admin/payments/${paymentId}`)).data;
