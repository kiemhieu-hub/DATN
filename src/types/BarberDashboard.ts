import type { AppointmentStatus, PaymentStatus } from "./Appointment";

export interface BarberDashboardAppointment {
  _id: string;
  appointmentCode: string;
  client: { _id: string; fullName: string; email: string; phone: string } | null;
  services: Array<{ name: string; price: number; durationMinutes: number }>;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  barberViewedAt?: string;
}

export interface BarberDashboardData {
  dateFrom: string;
  dateTo: string;
  today: string;
  revenue: number;
  revenueSeries: Array<{ date: string; amount: number }>;
  outcomes: {
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
    cancellationRate: number;
  };
  appointments: BarberDashboardAppointment[];
}

export interface GetBarberDashboardResponse {
  success: boolean;
  data: BarberDashboardData;
}
