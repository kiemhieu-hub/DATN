import api from "./api";

export interface FavoriteHairstyle {
  _id: string;
  userId: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

export const favoriteService = {
  getMyFavorites: async (): Promise<FavoriteHairstyle[]> => {
    const response = await api.get("/favorites");
    return response.data.data || [];
  },

  addFavorite: async (imageUrl: string, title: string): Promise<void> => {
    await api.post("/favorites", { imageUrl, title });
  },

  removeFavorite: async (imageUrl: string): Promise<void> => {
    await api.delete(`/favorites/${encodeURIComponent(imageUrl)}`);
  },
};
