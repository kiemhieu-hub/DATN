import type { Appointment, AppointmentStatus } from "./Appointment";

export interface AdminAppointmentPagination {
  page: number; limit: number; totalItems: number; totalPages: number;
}
export interface GetAdminAppointmentsResponse {
  success: boolean; items: Appointment[]; pagination: AdminAppointmentPagination;
}
export interface GetAdminAppointmentResponse { success: boolean; appointment: Appointment; }
export interface AdminAppointmentMutationResponse {
  success: boolean; message: string; appointment: Appointment;
}
export interface AdminAppointmentParams {
  keyword?: string; status?: AppointmentStatus | "ALL"; barberId?: string;
  appointmentDate?: string; page?: number; limit?: number;
}
