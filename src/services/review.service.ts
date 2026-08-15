import api from "./api";
import type { CreateReviewPayload, MyReview } from "../types/Review";

export const getMyReviews = async () => {
  const response = await api.get<{
    success: boolean;
    reviews: MyReview[];
  }>("/reviews/my");
  return response.data;
};

export const createReview = async (payload: CreateReviewPayload) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    review: MyReview;
  }>("/reviews", payload);
  return response.data;
};
