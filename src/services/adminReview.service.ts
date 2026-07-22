import api from "./api";
import type {
  AdminReview,
  AdminReviewResponse,
  ReviewStatus,
} from "../types/AdminReview";

interface ReviewFilters {
  keyword?: string;
  status?: ReviewStatus | "ALL";
  rating?: number | "ALL";
  page?: number;
  limit?: number;
}

export const getAdminReviews = async (filters: ReviewFilters) => {
  const response = await api.get<AdminReviewResponse>("/admin/reviews", {
    params: filters,
  });
  return response.data;
};

export const updateAdminReviewStatus = async (
  reviewId: string,
  status: ReviewStatus,
  moderationNote = ""
) => {
  const response = await api.patch<{
    success: boolean;
    message: string;
    review: AdminReview;
  }>(`/admin/reviews/${reviewId}/status`, { status, moderationNote });
  return response.data;
};

export const deleteAdminReview = async (reviewId: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/reviews/${reviewId}`
  );
  return response.data;
};