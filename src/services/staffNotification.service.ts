import api from "./api";
import type { StaffNotificationResponse } from "../types/StaffNotification";

export const getStaffNotifications = async (
  unreadOnly = false
) =>
  (
    await api.get<StaffNotificationResponse>(
      "/staff/notifications",
      { params: { unreadOnly } }
    )
  ).data;

export const markStaffNotificationRead =
  async (id: string) =>
    (
      await api.patch<{
        success: boolean;
        message: string;
      }>(
        `/staff/notifications/${id}/read`
      )
    ).data;

export const markAllStaffNotificationsRead =
  async () =>
    (
      await api.patch<{
        success: boolean;
        message: string;
      }>(
        "/staff/notifications/read-all"
      )
    ).data;
