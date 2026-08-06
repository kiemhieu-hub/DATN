import api from "./api";
import type { HairstyleGalleryItem } from "../types/HairstyleGallery";

export const getPublicHairstyles = async (category?: string) => {
  const response = await api.get<{ success: boolean; items: HairstyleGalleryItem[] }>(
    "/hairstyle-gallery",
    { params: category ? { category } : undefined }
  );
  return response.data;
};
