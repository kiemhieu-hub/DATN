import api from "./api";

import type { GetBarberDashboardResponse } from "../types/BarberDashboard";

export const getBarberDashboard =
  async (params?: { dateFrom?: string; dateTo?: string }): Promise<GetBarberDashboardResponse> => {
    const response =
      await api.get<GetBarberDashboardResponse>(
        "/barber/dashboard",
        { params }
      );

    return response.data;
  };
