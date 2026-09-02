import api from "./api";

import type {
  GetAdminDashboardResponse,
} from "../types/AdminDashboard";

export const getAdminDashboard =
  async (params: { period?: "DAY" | "MONTH" | "YEAR"; date?: string; fromDate?: string; toDate?: string; barberId?: string } = {}): Promise<GetAdminDashboardResponse> => {
    const response =
      await api.get<GetAdminDashboardResponse>(
        "/admin/dashboard", { params }
      );

    return response.data;
  };
