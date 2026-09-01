export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface ReviewPerson {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface AdminReview {
  _id: string;
  client: ReviewPerson;
  barber: ReviewPerson;
  appointment: {
    _id: string;
    appointmentCode: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
  };
  serviceRatings: Array<{
    service: { _id: string; name: string; image?: string };
    rating: number;
    comment: string;
  }>;
  barberRating: number;
  barberComment: string;
  overallRating: number;
  status: ReviewStatus;
  moderationNote: string;
  createdAt: string;
}

export interface AdminReviewResponse {
  success: boolean;
  items: AdminReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: Record<ReviewStatus, number>;
}
