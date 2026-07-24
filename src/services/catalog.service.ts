import api from "./api";

import type {
  GetBarberDetailResponse,
  GetBarbersResponse,
  GetServicesResponse,
} from "../types/Catalog";


export const getCatalogServices =
  async (): Promise<GetServicesResponse> => {
    const response =
      await api.get<GetServicesResponse>(
        "/catalog/services"
      );

    return response.data;
  };


export const getCatalogBarbers =
  async (): Promise<GetBarbersResponse> => {
    const response =
      await api.get<GetBarbersResponse>(
        "/catalog/barbers"
      );

    return response.data;
  };


export const getCatalogBarberById =
  async (
    barberId: string
  ): Promise<GetBarberDetailResponse> => {
    const response =
      await api.get<GetBarberDetailResponse>(
        `/catalog/barbers/${barberId}`
      );

    return response.data;
  };