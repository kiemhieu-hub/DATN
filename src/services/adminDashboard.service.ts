import api from "./api";

import type {
  GetAdminDashboardResponse,
} from "../types/AdminDashboard";

export const getAdminDashboard =
  async (): Promise<GetAdminDashboardResponse> => {
    const response =
      await api.get<GetAdminDashboardResponse>(
        "/admin/dashboard"
      );

    return response.data;
  };