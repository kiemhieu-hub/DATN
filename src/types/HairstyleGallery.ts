export interface HairstyleGalleryItem {
  _id: string;
  title: string;
  image: string;
  category: string;
  description: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HairstyleGalleryPayload {
  title: string;
  image: string;
  category: string;
  description: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}
