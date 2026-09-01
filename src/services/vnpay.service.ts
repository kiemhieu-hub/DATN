import api from "./api";

export type VnpayPurpose = "DEPOSIT" | "BALANCE";

export interface VnpayPaymentResult {
  success: boolean;
  paymentUrl: string;
  transactionCode: string;
  amount: number;
  purpose: "DEPOSIT" | "BALANCE" | "FULL";
}

export const createVnpayPayment = async (
  appointmentId: string,
  purpose: VnpayPurpose
): Promise<VnpayPaymentResult> => {
  const response = await api.post<VnpayPaymentResult>(
    "/payments/vnpay/create",
    { appointmentId, purpose }
  );
  return response.data;
};

export const verifyVnpayReturn = async (queryString: string) => {
  const response = await api.get<{
    success: boolean;
    message: string;
    rspCode: string;
  }>(`/payments/vnpay/return${queryString}`);
  return response.data;
};
