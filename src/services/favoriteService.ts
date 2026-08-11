import api from "./api";

export interface FavoriteHairstyle {
  _id: string;
  imageUrl: string;
  title: string;
  category: string;
  createdAt: string;
}

export interface AddFavoritePayload {
  imageUrl: string;
  title: string;
  category?: string;
}

export const getMyFavorites = async (): Promise<FavoriteHairstyle[]> => {
  const response = await api.get<{
    success: boolean;
    items: FavoriteHairstyle[];
  }>("/favorites");
  return response.data.items;
};

export const addFavorite = async (payload: AddFavoritePayload) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    item: FavoriteHairstyle;
  }>("/favorites", payload);
  return response.data;
};

export const removeFavorite = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/favorites/${id}`
  );
  return response.data;
};
