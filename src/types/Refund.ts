export type RefundStatus = "PENDING" | "PROCESSING" | "REFUNDED" | "REFUNDED_MANUAL" | "FAILED" | "REJECTED";
export interface Refund {
  _id: string;
  appointment: { _id: string; appointmentCode: string; customer?: { fullName: string; email: string }; cancellation?: { refundBankName?: string; refundAccountNumber?: string; refundAccountName?: string } };
  amount: number;
  reason: string;
  method: "VNPAY" | "BANK_TRANSFER" | "CASH";
  status: RefundStatus;
  bankReference?: string;
  proofImage?: string;
  requestedAt: string;
  completedAt?: string;
  failureReason?: string;
}
