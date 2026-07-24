import type { Appointment } from "./Appointment";

export type PaymentMethod =| "CASH"| "VNPAY"| "MOMO"| "BANK_TRANSFER";

export type PaymentTransactionStatus =| "PENDING"| "PAID"| "FAILED"| "CANCELLED"| "REFUNDED";

export interface PaymentClient {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Payment {
  _id: string;
  appointment: string | Appointment;
  client: string | PaymentClient;
  amount: number;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  transactionCode: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaymentSummary {
  totalAmount: number;
  paidCount: number;
}

export interface GetPaymentsParams {
  keyword?: string;
  status?: PaymentTransactionStatus | "ALL";
  method?: PaymentMethod | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface GetPaymentsResponse {
  success: boolean;
  items: Payment[];
  pagination: PaymentPagination;
  summary: PaymentSummary;
}

export interface GetPaymentResponse {
  success: boolean;
  payment: Payment;
}

export interface ConfirmCashPaymentResponse {
  success: boolean;
  message: string;
  payment: Payment;
  appointment: Appointment;
}