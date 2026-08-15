import api from "./api";

import type {
  Appointment,
  AppointmentStatus,
} from "../types/Appointment";

export interface BarberAppointmentsParams {
  status?: AppointmentStatus;
  appointmentDate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetBarberAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
}

export interface UpdateBarberAppointmentStatusPayload {
  status: AppointmentStatus;
  reason?: string;
}

export interface UpdateBarberAppointmentStatusResponse {
  success: boolean;
  message: string;
  appointment: Appointment;
}

export const getBarberAppointments = async (
  params: BarberAppointmentsParams = {}
): Promise<GetBarberAppointmentsResponse> => {
  const response =
    await api.get<GetBarberAppointmentsResponse>(
      "/barber/appointments",
      {
        params,
      }
    );

  return response.data;
};

export const updateBarberAppointmentStatus =
  async (
    appointmentId: string,
    payload: UpdateBarberAppointmentStatusPayload
  ): Promise<UpdateBarberAppointmentStatusResponse> => {
    const response =
      await api.patch<UpdateBarberAppointmentStatusResponse>(
        `/barber/appointments/${appointmentId}/status`,
        payload
      );

    return response.data;
  };

export const markBarberAppointmentViewed = async (appointmentId: string) => {
  const response = await api.patch(
    `/barber/appointments/${appointmentId}/viewed`
  );
  return response.data;
};
