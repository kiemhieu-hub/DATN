import api from "./api";

import type {
  GetBarberProfileResponse,
  UpdateBarberProfilePayload,
  UpdateBarberProfileResponse,
} from "../types/BarberProfile";

export const getMyBarberProfile =
  async (): Promise<GetBarberProfileResponse> => {
    const response =
      await api.get<GetBarberProfileResponse>(
        "/barber/profile/me"
      );

    return response.data;
  };

export const updateMyBarberProfile =
  async (
    payload: UpdateBarberProfilePayload
  ): Promise<UpdateBarberProfileResponse> => {
    const response =
      await api.put<UpdateBarberProfileResponse>(
        "/barber/profile/me",
        payload
      );

    return response.data;
  };