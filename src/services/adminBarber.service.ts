import api from "./api";

import type {
  AdminBarberMutationResponse,
  CreateAdminBarberPayload,
  GetAdminBarberResponse,
  GetAdminBarbersParams,
  GetAdminBarbersResponse,
  ResetAdminBarberPasswordPayload,
  ResetAdminBarberPasswordResponse,
  UpdateAdminBarberPayload,
  UpdateAdminBarberStatusPayload,
} from "../types/AdminBarber";

export const getAdminBarbers = async (
  params: GetAdminBarbersParams = {}
): Promise<GetAdminBarbersResponse> => {
  const response =
    await api.get<GetAdminBarbersResponse>(
      "/admin/barbers",
      {
        params,
      }
    );

  return response.data;
};

export const getAdminBarberById = async (
  barberId: string
): Promise<GetAdminBarberResponse> => {
  const response =
    await api.get<GetAdminBarberResponse>(
      `/admin/barbers/${barberId}`
    );

  return response.data;
};

export const createAdminBarber = async (
  payload: CreateAdminBarberPayload
): Promise<AdminBarberMutationResponse> => {
  const response =
    await api.post<AdminBarberMutationResponse>(
      "/admin/barbers",
      payload
    );

  return response.data;
};

export const updateAdminBarber = async (
  barberId: string,
  payload: UpdateAdminBarberPayload
): Promise<AdminBarberMutationResponse> => {
  const response =
    await api.put<AdminBarberMutationResponse>(
      `/admin/barbers/${barberId}`,
      payload
    );

  return response.data;
};

export const updateAdminBarberStatus =
  async (
    barberId: string,
    payload: UpdateAdminBarberStatusPayload
  ): Promise<AdminBarberMutationResponse> => {
    const response =
      await api.patch<AdminBarberMutationResponse>(
        `/admin/barbers/${barberId}/status`,
        payload
      );

    return response.data;
  };

export const resetAdminBarberPassword =
  async (
    barberId: string,
    payload: ResetAdminBarberPasswordPayload
  ): Promise<ResetAdminBarberPasswordResponse> => {
    const response =
      await api.patch<ResetAdminBarberPasswordResponse>(
        `/admin/barbers/${barberId}/reset-password`,
        payload
      );

    return response.data;
  };