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

export interface PublicBarberReview {
  _id: string;
  client?: { _id: string; fullName: string; avatar?: string };
  barberRating: number;
  barberComment: string;
  overallRating: number;
  createdAt: string;
}
