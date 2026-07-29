import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import Review from "../models/Review";
import AppError from "../utils/AppError";

interface ServiceRatingInput {
  serviceId: string;
  rating: number;
  comment?: string;
}

interface CreateReviewInput {
  appointmentId: string;
  barberRating: number;
  barberComment?: string;
  serviceRatings: ServiceRatingInput[];
}

const validRating = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 5;

export const createClientReview = async (
  clientId: string,
  input: CreateReviewInput
) => {
  if (!mongoose.Types.ObjectId.isValid(input.appointmentId)) {
    throw new AppError("Mã lịch hẹn không hợp lệ", 400);
  }

  if (!validRating(input.barberRating)) {
    throw new AppError("Điểm Barber phải từ 1 đến 5 sao", 400);
  }

  const appointment = await Appointment.findOne({
    _id: input.appointmentId,
    client: clientId,
  });

  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);
  if (appointment.status !== "COMPLETED") {
    throw new AppError("Chỉ có thể đánh giá lịch hẹn đã hoàn thành", 400);
  }

  if (await Review.exists({ appointment: appointment._id })) {
    throw new AppError("Lịch hẹn này đã được đánh giá", 409);
  }

  if (!Array.isArray(input.serviceRatings)) {
    throw new AppError("Vui lòng đánh giá các dịch vụ đã sử dụng", 400);
  }

  const appointmentServiceIds = appointment.services.map((item) =>
    String(item.service)
  );
  const ratingMap = new Map(
    input.serviceRatings.map((item) => [item.serviceId, item])
  );

  if (
    ratingMap.size !== appointmentServiceIds.length ||
    appointmentServiceIds.some((serviceId) => !ratingMap.has(serviceId))
  ) {
    throw new AppError("Phải đánh giá đầy đủ và đúng các dịch vụ trong lịch hẹn", 400);
  }

  const serviceRatings = appointmentServiceIds.map((serviceId) => {
    const item = ratingMap.get(serviceId);
    if (!item || !validRating(item.rating)) {
      throw new AppError("Điểm dịch vụ phải từ 1 đến 5 sao", 400);
    }
    return {
      service: new mongoose.Types.ObjectId(serviceId),
      rating: item.rating,
      comment: String(item.comment ?? "").trim(),
    };
  });

  const allRatings = [input.barberRating, ...serviceRatings.map((item) => item.rating)];
  const overallRating = Number(
    (allRatings.reduce((total, item) => total + item, 0) / allRatings.length).toFixed(1)
  );

  return Review.create({
    appointment: appointment._id,
    client: appointment.client,
    barber: appointment.barber,
    serviceRatings,
    barberRating: input.barberRating,
    barberComment: String(input.barberComment ?? "").trim(),
    overallRating,
    status: "PENDING",
  });
};

export const getMyReviews = async (clientId: string) =>
  Review.find({ client: clientId })
    .select("appointment overallRating status createdAt")
    .sort({ createdAt: -1 })
    .lean();
