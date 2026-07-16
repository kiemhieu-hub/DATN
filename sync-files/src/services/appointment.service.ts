import api from "./api";

import type {
  Appointment,
  AppointmentService,
} from "../types/Appointment";

export interface CreateAppointmentPayload {
  services: AppointmentService[];
  barberName: string;
  appointmentDate: string;
  timeSlot: string;
  note?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  appointment: Appointment;
}

export interface GetMyAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
}

export interface CancelAppointmentPayload {
  cancelReason: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
  appointment: Appointment;
}

/**
 * Tạo lịch hẹn mới
 * POST /api/appointments
 */
export const createAppointment = async (
  payload: CreateAppointmentPayload
): Promise<CreateAppointmentResponse> => {
  const response =
    await api.post<CreateAppointmentResponse>(
      "/appointments",
      payload
    );

  return response.data;
};

/**
 * Lấy lịch sử đặt lịch của tài khoản hiện tại
 * GET /api/appointments/my
 */
export const getMyAppointments =
  async (): Promise<GetMyAppointmentsResponse> => {
    const response =
      await api.get<GetMyAppointmentsResponse>(
        "/appointments/my"
      );

    return response.data;
  };

/**
 * Hủy lịch hẹn
 * PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (
  appointmentId: string,
  payload: CancelAppointmentPayload
): Promise<CancelAppointmentResponse> => {
  const response =
    await api.patch<CancelAppointmentResponse>(
      `/appointments/${appointmentId}/cancel`,
      payload
    );

  return response.data;
};