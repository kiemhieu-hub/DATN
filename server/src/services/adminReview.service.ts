import mongoose from "mongoose";
import BarberProfile from "../models/BarberProfile";
import Review, { type ReviewStatus } from "../models/Review";
import AppError from "../utils/AppError";

interface ReviewFilters {
  keyword?: string;
  status?: ReviewStatus | "ALL";
  rating?: number;
  page?: number;
  limit?: number;
}

const assertId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Mã review không hợp lệ", 400);
  }
};

const syncBarberRating = async (barberId: mongoose.Types.ObjectId) => {
  const [result] = await Review.aggregate<{
    averageRating: number;
    reviewCount: number;
  }>([
    { $match: { barber: barberId, status: "APPROVED" } },
    {
      $group: {
        _id: "$barber",
        averageRating: { $avg: "$overallRating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await BarberProfile.findOneAndUpdate(
    { user: barberId },
    {
      averageRating: result ? Number(result.averageRating.toFixed(1)) : 0,
      reviewCount: result?.reviewCount ?? 0,
    }
  );
};

const populatedReview = (id: string) =>
  Review.findById(id)
    .populate("client", "fullName email phone")
    .populate("barber", "fullName email phone")
    .populate("appointment", "appointmentCode appointmentDate startTime endTime")
    .populate("serviceRatings.service", "name image")
    .populate("approvedBy rejectedBy hiddenBy", "fullName")
    .lean();

export const listAdminReviews = async (filters: ReviewFilters) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
  const query: Record<string, unknown> = {};

  if (filters.status && filters.status !== "ALL") query.status = filters.status;
  if (filters.rating && filters.rating >= 1 && filters.rating <= 5) {
    query.overallRating = filters.rating;
  }

  if (filters.keyword?.trim()) {
    const keyword = filters.keyword.trim();
    const userIds = await mongoose.model("User").find(
      {
        $or: [
          { fullName: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
        ],
      },
      { _id: 1 }
    ).lean();

    query.$or = [
      { client: { $in: userIds.map((user) => user._id) } },
      { barber: { $in: userIds.map((user) => user._id) } },
      { barberComment: { $regex: keyword, $options: "i" } },
      { "serviceRatings.comment": { $regex: keyword, $options: "i" } },
    ];
  }

  const [items, total, statusCounts] = await Promise.all([
    Review.find(query)
      .populate("client", "fullName email phone")
      .populate("barber", "fullName email phone")
      .populate("appointment", "appointmentCode appointmentDate startTime endTime")
      .populate("serviceRatings.service", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(query),
    Review.aggregate<{ _id: ReviewStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    summary: statusCounts.reduce<Record<string, number>>(
      (accumulator, item) => ({ ...accumulator, [item._id]: item.count }),
      { PENDING: 0, APPROVED: 0, REJECTED: 0, HIDDEN: 0 }
    ),
  };
};

export const updateAdminReviewStatus = async (
  id: string,
  status: ReviewStatus,
  moderationNote: string,
  adminId: string
) => {
  assertId(id);
  const review = await Review.findById(id);
  if (!review) throw new AppError("Không tìm thấy review", 404);

  const note = moderationNote.trim();
  if (["REJECTED", "HIDDEN"].includes(status) && !note) {
    throw new AppError("Vui lòng nhập lý do từ chối hoặc ẩn review", 400);
  }

  review.status = status;
  review.moderationNote = note;
  review.approvedBy = undefined;
  review.approvedAt = undefined;
  review.rejectedBy = undefined;
  review.rejectedAt = undefined;
  review.hiddenBy = undefined;
  review.hiddenAt = undefined;

  const actorId = new mongoose.Types.ObjectId(adminId);
  if (status === "APPROVED") {
    review.approvedBy = actorId;
    review.approvedAt = new Date();
  } else if (status === "REJECTED") {
    review.rejectedBy = actorId;
    review.rejectedAt = new Date();
  } else if (status === "HIDDEN") {
    review.hiddenBy = actorId;
    review.hiddenAt = new Date();
  }

  await review.save();
  await syncBarberRating(review.barber);

  return populatedReview(id);
};

export const deleteAdminReview = async (id: string) => {
  assertId(id);
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new AppError("Không tìm thấy review", 404);

  await syncBarberRating(review.barber);
  return { id };
};
