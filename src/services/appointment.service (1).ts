import api from "./api";

import type { Appointment } from "../types/Appointment";

export interface CreateAppointmentPayload {
  barberId: string;
  careBarberId?: string;
  serviceIds: string[];
  appointmentDate: string;
  startTime: string;
  note?: string;
  voucherCode?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
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
  reason: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
  appointment: Appointment;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

export interface GetAvailableSlotsResponse {
  success: boolean;
  slots: AvailableSlot[];
}

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


export const getMyAppointments =
  async (): Promise<GetMyAppointmentsResponse> => {
    const response =
      await api.get<GetMyAppointmentsResponse>(
        "/appointments/my"
      );

    return response.data;
  };


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

export const getAvailableSlots = async (
  barberId: string | undefined,
  serviceIds: string[],
  appointmentDate: string
): Promise<GetAvailableSlotsResponse> => {
  const response =
    await api.get<GetAvailableSlotsResponse>(
      "/appointments/available-slots",
      {
        params: {
          barberId,
          appointmentDate,
          serviceIds: serviceIds.join(","),
        },
      }
    );

  return response.data;
};
