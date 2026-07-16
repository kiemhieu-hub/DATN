export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED";

export type UserRole =
  | "CLIENT"
  | "BARBER"
  | "ADMIN";

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

export interface AppointmentCancellation {
  cancelledBy?:
    | string
    | AppointmentUser;

  cancelledByRole?:
    | "CLIENT"
    | "BARBER"
    | "ADMIN";

  reason: string;
  cancelledAt?: string;
}

export interface Appointment {
  _id: string;

  client:
    | string
    | AppointmentUser;

  barber:
    | string
    | AppointmentUser;

  services: AppointmentService[];

  totalPrice: number;
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

  createdAt: string;

  updatedAt: string;
}