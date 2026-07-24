import api from "./api";

export type AdminContentKind =
  | "vouchers"
  | "reviews"
  | "service-categories"
  | "hairstyle-gallery";

export interface AdminContentItem {
  _id: string;
  [key: string]: unknown;
}

export const getAdminContent = async (kind: AdminContentKind) => {
  const response = await api.get<{
    success: boolean;
    items: AdminContentItem[];
  }>(`/admin/${kind}`);

  return response.data;
};

export const deleteAdminContent = async (
  kind: AdminContentKind,
  itemId: string
) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/${kind}/${itemId}`);

  return response.data;
};
