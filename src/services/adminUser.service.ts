import api from "./api";

import type {
  AdminUserStatus,
  GetAdminUserResponse,
  GetAdminUsersParams,
  GetAdminUsersResponse,
  UpdateAdminUserStatusResponse,
} from "../types/AdminUser";

export const getAdminUsers = async (
  params: GetAdminUsersParams = {}
): Promise<GetAdminUsersResponse> => {
  const response = await api.get<GetAdminUsersResponse>(
    "/admin/users",
    { params }
  );

  return response.data;
};

export const getAdminUserById = async (
  userId: string
): Promise<GetAdminUserResponse> => {
  const response = await api.get<GetAdminUserResponse>(
    `/admin/users/${userId}`
  );

  return response.data;
};

export const updateAdminUserStatus = async (
  userId: string,
  status: AdminUserStatus
): Promise<UpdateAdminUserStatusResponse> => {
  const response =
    await api.patch<UpdateAdminUserStatusResponse>(
      `/admin/users/${userId}/status`,
      { status }
    );

  return response.data;
};
export const updateAdminUserRole = async (
  userId: string,
  role: string
) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};
export const deleteAdminUser = async (userId: string) =>
  (await api.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`)).data;
