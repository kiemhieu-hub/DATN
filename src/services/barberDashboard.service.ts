import api from "./api";

import type { GetBarberDashboardResponse } from "../types/BarberDashboard";

export const getBarberDashboard =
  async (): Promise<GetBarberDashboardResponse> => {
    const response =
      await api.get<GetBarberDashboardResponse>(
        "/barber/dashboard"
      );

    return response.data;
  };