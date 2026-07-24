import type { AppointmentStatus } from "./Appointment";

export interface BarberDashboardStatistics {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  todayRevenue: number;
}

export interface BarberDashboardClient {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface BarberDashboardServiceItem {
  name: string;
  price: number;
  durationMinutes: number;
}

export interface BarberDashboardAppointment {
  _id: string;
  client: BarberDashboardClient | null;
  services: BarberDashboardServiceItem[];
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
}

export interface BarberDashboardData {
  date: string;
  statistics: BarberDashboardStatistics;
  nextAppointment: BarberDashboardAppointment | null;
  todayAppointments: BarberDashboardAppointment[];
}

export interface GetBarberDashboardResponse {
  success: boolean;
  data: BarberDashboardData;
}