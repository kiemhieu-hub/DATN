import api from "./api";

import type {
  BarberScheduleDay,
  GetBarberScheduleResponse,
  UpdateBarberScheduleDayResponse,
  UpdateBarberScheduleResponse,
} from "../types/BarberSchedule";

export const getMyBarberSchedule =
  async (): Promise<GetBarberScheduleResponse> => {
    const response =
      await api.get<GetBarberScheduleResponse>(
        "/barber/schedule"
      );

    return response.data;
  };

export const updateMyWeeklySchedule =
  async (
    schedules: BarberScheduleDay[]
  ): Promise<UpdateBarberScheduleResponse> => {
    const response =
      await api.patch<UpdateBarberScheduleResponse>(
        "/barber/schedule",
        {
          schedules,
        }
      );

    return response.data;
  };

export const updateMyScheduleDay =
  async (
    schedule: BarberScheduleDay
  ): Promise<UpdateBarberScheduleDayResponse> => {
    const response =
      await api.patch<UpdateBarberScheduleDayResponse>(
        "/barber/schedule/day",
        schedule
      );

    return response.data;
  };