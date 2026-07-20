import api from "./api";
import type { AppointmentStatus } from "../types/Appointment";
import type { AdminAppointmentMutationResponse, AdminAppointmentParams, GetAdminAppointmentResponse, GetAdminAppointmentsResponse } from "../types/AdminAppointment";

export const getAdminAppointments = async (params: AdminAppointmentParams = {}) =>
  (await api.get<GetAdminAppointmentsResponse>("/admin/appointments", { params })).data;
export const getAdminAppointment = async (id: string) =>
  (await api.get<GetAdminAppointmentResponse>(`/admin/appointments/${id}`)).data;
export const updateAdminAppointmentStatus = async (id: string, status: AppointmentStatus, reason?: string) =>
  (await api.patch<AdminAppointmentMutationResponse>(`/admin/appointments/${id}/status`, { status, reason })).data;
export const changeAdminAppointmentBarber = async (id: string, barberId: string) =>
  (await api.patch<AdminAppointmentMutationResponse>(`/admin/appointments/${id}/barber`, { barberId })).data;
export const rescheduleAdminAppointment = async (id: string, appointmentDate: string, startTime: string, customerConsent: boolean) =>
  (await api.patch<AdminAppointmentMutationResponse>(`/admin/appointments/${id}/reschedule`, { appointmentDate, startTime, customerConsent })).data;
export const updateAdminAppointmentServices = async (id: string, serviceIds: string[]) =>
  (await api.patch<AdminAppointmentMutationResponse>(`/admin/appointments/${id}/services`, { serviceIds })).data;
export const deleteAdminAppointment = async (id: string) =>
  (await api.delete<{ success: boolean; message: string }>(`/admin/appointments/${id}`)).data;
