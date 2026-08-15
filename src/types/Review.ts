export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface MyReview {
  _id: string;
  appointment: string;
  overallRating: number;
  status: ReviewStatus;
  createdAt: string;
}

export interface CreateReviewPayload {
  appointmentId: string;
  barberRating: number;
  barberComment: string;
  serviceRatings: Array<{
    serviceId: string;
    rating: number;
    comment: string;
  }>;
}
