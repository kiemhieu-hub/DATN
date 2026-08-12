export type AppointmentStatus =| "PENDING"| "CONFIRMED"| "CHECKED_IN"| "IN_PROGRESS"| "COMPLETED"| "NO_SHOW"| "CANCELLED";
export type PaymentStatus =| "UNPAID"| "PENDING"| "PAID"| "REFUNDED";
export type UserRole =| "CLIENT"| "BARBER"| "RECEPTIONIST"| "ADMIN";

export interface AppointmentUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: string;
}

export interface AppointmentServiceReference {
  _id: string;
  name: string;
  image?: string;
  group?: string;
  isActive?: boolean;
}

export interface AppointmentService {
  service:
    | string
    | AppointmentServiceReference;

  nameSnapshot: string;
  priceSnapshot: number;
  durationSnapshot: number;
}

export interface AppointmentStaffAssignment {
  barber: string | AppointmentUser;
  staffType: "HAIR" | "CARE";
  serviceIds: string[];
  startTime: string;
  endTime: string;
}

export interface AppointmentCancellation {
  cancelledBy?:
    | string
    | AppointmentUser;

  cancelledByRole?:
    | "CLIENT"
    | "BARBER"
    | "RECEPTIONIST"
    | "ADMIN";

  reason: string;
  cancelledAt?: string;
  depositRefundStatus?: "NOT_APPLICABLE" | "ELIGIBLE" | "NOT_ELIGIBLE" | "REFUNDED";
  depositRefundAmount?: number;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
  refundEligible?: boolean;
  refundAmount?: number;
  policyApplied?: string;
  refundStatus?: string;
}

export interface AppointmentActivityActor {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AppointmentActivity {
  _id: string;
  action: string;
  description: string;
  actor?: string | AppointmentActivityActor;
  actorRole: UserRole | "SYSTEM";
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  appointmentCode: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };

  client:
    | string
    | AppointmentUser;

  barber:
    | string
    | AppointmentUser;

  services: AppointmentService[];
  staffAssignments?: AppointmentStaffAssignment[];

  totalPrice: number;
  subtotal: number;
  voucherCode: string;
  discountPercent: number;
  discountAmount: number;
  depositRequired: boolean;
  depositAmount: number;
  depositPaid: boolean;
  depositExpiresAt?: string;
  depositExpiredAt?: string;
  durationMinutes: number;

  appointmentDate: string;
  startTime: string;
  endTime: string;

  status: AppointmentStatus;
  paymentStatus: PaymentStatus;

  note: string;

  cancellation?: AppointmentCancellation;

  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  checkedInAt?: string;
  noShowAt?: string;
  rescheduleConsent?: boolean;
  activities?: AppointmentActivity[];

  createdAt: string;

  updatedAt: string;
  barberViewedAt?: string;
  finalPrice?: number;
  finalDiscountAmount?: number;
  voucherAppliedAt?: string;
  workProgress?: {
    hair: "NOT_REQUIRED" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
    care: "NOT_REQUIRED" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
    hairStartedAt?: string;
    hairCompletedAt?: string;
    careStartedAt?: string;
    careCompletedAt?: string;
  };
  cancellationPolicySnapshot?: {
    fullRefundHours: number;
    shopCancellationRefundPercent: number;
    lateCancellationRefundPercent: number;
    noShowRefundPercent: number;
    capturedAt: string;
  };
}
