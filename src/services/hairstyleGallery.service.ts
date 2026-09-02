import api from "./api";

import type {
  HairstyleGalleryItem,
} from "../types/HairstyleGallery";

export interface PublicHairstylesResponse {
  success: boolean;
  items: HairstyleGalleryItem[];
}

export const getPublicHairstyles =
  async (
    category?: string
  ): Promise<PublicHairstylesResponse> => {
    const response =
      await api.get<PublicHairstylesResponse>(
        "/hairstyle-gallery",
        {
          params: category
            ? { category }
            : undefined,
        }
      );

    return response.data;
  };