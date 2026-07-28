import type {
  AppointmentStatus,
  PaymentStatus,
} from "./Appoinment";

export interface AdminDashboardStatistics {
  totalUsers: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;

  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  inProgressAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;

  todayAppointments: number;
  todayRevenue: number;
  totalRevenue: number;
}

export interface AdminDashboardRevenuePoint {
  date: string;
  revenue: number;
  completedAppointments: number;
}

export interface AdminDashboardUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface AdminDashboardAppointmentService {
  service: string | {
    _id: string;
    name?: string;
  };

  nameSnapshot: string;
  priceSnapshot: number;
  durationSnapshot: number;
}

export interface AdminDashboardAppointment {
  _id: string;

  client:
    | string
    | AdminDashboardUser;

  barber:
    | string
    | AdminDashboardUser;

  services: AdminDashboardAppointmentService[];

  totalPrice: number;
  durationMinutes: number;

  appointmentDate: string;
  startTime: string;
  endTime: string;

  status: AppointmentStatus;
  paymentStatus: PaymentStatus;

  note: string;

  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardData {
  date: string;

  statistics: AdminDashboardStatistics;

  revenueLastSevenDays:
    AdminDashboardRevenuePoint[];

  recentAppointments:
    AdminDashboardAppointment[];
  revenueByBarber: Array<{
    barberId: string;
    barberName: string;
    revenue: number;
    appointments: number;
  }>;
  revenueFilter: {
    period: "DAY" | "MONTH" | "YEAR";
    date: string;
    barberId: string;
  };
}

export interface GetAdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}
