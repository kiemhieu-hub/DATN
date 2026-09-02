import api from "./api";

export interface FavoriteHairstyle {
  _id: string;
  userId: string;
  imageUrl: string;
  title: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

interface FavoriteListResponse {
  success: boolean;
  items: FavoriteHairstyle[];
}

interface FavoriteMutationResponse {
  success: boolean;
  message: string;
  favorite: FavoriteHairstyle;
}

export const getMyFavorites = async (): Promise<FavoriteHairstyle[]> => {
  const response = await api.get<FavoriteListResponse>("/favorites");
  return response.data.items;
};

export const addFavorite = async (payload: {
  imageUrl: string;
  title: string;
  category?: string;
}): Promise<FavoriteHairstyle> => {
  const response = await api.post<FavoriteMutationResponse>(
    "/favorites",
    payload
  );

  return response.data.favorite;
};

export const removeFavorite = async (
  favoriteId: string
): Promise<void> => {
  await api.delete(`/favorites/${favoriteId}`);
};