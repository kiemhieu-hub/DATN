import mongoose from "mongoose";
import Appointment, { type AppointmentStatus } from "../models/Appointment";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";
import Service from "../models/Service";
import { updateAppointmentStatus } from "./appointment.service";
import Payment from "../models/Payment";
import Review from "../models/Review";

interface ListInput {
  keyword?: string;
  status?: AppointmentStatus | "ALL";
  barberId?: string;
  appointmentDate?: string;
  page?: number;
  limit?: number;
}

const statuses: AppointmentStatus[] = [
  "PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS",
  "COMPLETED", "NO_SHOW", "CANCELLED",
];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && aEnd > bStart;
const assertId = (id: string, message: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(message, 400);
};

const populate = (query: any) => query
  .populate("client", "fullName email phone role status")
  .populate("barber", "fullName email phone role status")
  .populate("services.service", "name image group isActive");

export const listAdminAppointments = async (input: ListInput) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(input.limit) || 10));
  const filter: Record<string, unknown> = {};

  if (input.status && input.status !== "ALL") {
    if (!statuses.includes(input.status)) throw new AppError("Trạng thái không hợp lệ", 400);
    filter.status = input.status;
  }
  if (input.barberId) {
    assertId(input.barberId, "Mã Barber không hợp lệ");
    filter.barber = input.barberId;
  }
  if (input.appointmentDate) {
    if (!datePattern.test(input.appointmentDate)) throw new AppError("Ngày hẹn không hợp lệ", 400);
    filter.appointmentDate = input.appointmentDate;
  }
  if (input.keyword?.trim()) {
    const regex = new RegExp(input.keyword.trim(), "i");
    const users = await User.find({
      $or: [{ fullName: regex }, { email: regex }, { phone: regex }],
    }).select("_id").lean();
    filter.client = { $in: users.map((user) => user._id) };
  }

  const [items, totalItems] = await Promise.all([
    populate(Appointment.find(filter))
      .sort({ appointmentDate: -1, startTime: -1, createdAt: -1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    Appointment.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) } };
};

export const getAdminAppointmentDetail = async (id: string) => {
  assertId(id, "Mã lịch hẹn không hợp lệ");
  const item = await populate(Appointment.findById(id)).lean();
  if (!item) throw new AppError("Không tìm thấy lịch hẹn", 404);
  return item;
};

export const changeAdminAppointmentStatus = async (
  appointmentId: string,
  actorId: string,
  actorRole: "ADMIN" | "RECEPTIONIST",
  status: AppointmentStatus,
  reason?: string
) => {
  if (!statuses.includes(status)) throw new AppError("Trạng thái không hợp lệ", 400);
  if (status === "CANCELLED" && !reason?.trim()) throw new AppError("Vui lòng nhập lý do hủy lịch", 400);
  return updateAppointmentStatus({ appointmentId, actorId, actorRole, status, reason });
};

export const reassignAppointmentBarber = async (appointmentId: string, barberId: string) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  assertId(barberId, "Mã Barber không hợp lệ");
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);
  if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
    throw new AppError("Không thể đổi Barber cho lịch đã hoàn thành hoặc đã hủy", 400);
  }
  const barber = await User.findOne({ _id: barberId, role: "BARBER", status: "ACTIVE" }).select("_id");
  if (!barber) throw new AppError("Barber không tồn tại hoặc đã ngừng hoạt động", 404);

  const dayOfWeek = new Date(`${appointment.appointmentDate}T00:00:00`).getDay();
  const schedule = await BarberSchedule.findOne({ barber: barberId, dayOfWeek, isWorking: true }).lean();
  if (!schedule) throw new AppError("Barber không làm việc trong ngày đã chọn", 409);
  const start = timeToMinutes(appointment.startTime);
  const end = timeToMinutes(appointment.endTime);
  if (start < timeToMinutes(schedule.startTime) || end > timeToMinutes(schedule.endTime)) {
    throw new AppError("Lịch hẹn nằm ngoài giờ làm việc của Barber", 409);
  }
  const existing = await Appointment.find({
    _id: { $ne: appointmentId }, barber: barberId,
    appointmentDate: appointment.appointmentDate,
    status: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"] },
  }).select("startTime endTime").lean();
  if (existing.some((item) => overlaps(start, end, timeToMinutes(item.startTime), timeToMinutes(item.endTime)))) {
    throw new AppError("Barber đã có lịch trùng khung giờ này", 409);
  }

  appointment.barber = new mongoose.Types.ObjectId(barberId);
  await appointment.save();
  return getAdminAppointmentDetail(appointmentId);
};

export const rescheduleAppointment = async (
  appointmentId: string,
  appointmentDate: string,
  startTime: string,
  consent: boolean
) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  if (!consent) throw new AppError("Cần xác nhận khách hàng đã đồng ý đổi lịch", 400);
  if (!datePattern.test(appointmentDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    throw new AppError("Ngày hoặc giờ hẹn không hợp lệ", 400);
  }
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || ["COMPLETED", "CANCELLED"].includes(appointment.status)) {
    throw new AppError("Không thể đổi lịch hẹn này", 400);
  }
  const duration = appointment.durationMinutes;
  const endTime = `${String(Math.floor((timeToMinutes(startTime) + duration) / 60)).padStart(2, "0")}:${String((timeToMinutes(startTime) + duration) % 60).padStart(2, "0")}`;
  appointment.appointmentDate = appointmentDate;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.rescheduleConsent = true;
  if (appointment.status === "NO_SHOW") appointment.status = "CONFIRMED";
  await appointment.save();
  return getAdminAppointmentDetail(appointmentId);
};

export const replaceAppointmentServices = async (
  appointmentId: string,
  serviceIds: string[]
) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  const uniqueIds = [...new Set(serviceIds ?? [])];
  if (!uniqueIds.length || uniqueIds.length !== serviceIds.length) {
    throw new AppError("Danh sách dịch vụ trống hoặc bị trùng", 400);
  }
  uniqueIds.forEach((id) => assertId(id, "Mã dịch vụ không hợp lệ"));
  const [appointment, services] = await Promise.all([
    Appointment.findById(appointmentId),
    Service.find({ _id: { $in: uniqueIds }, isActive: true }),
  ]);
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);
  if (!['CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status)) {
    throw new AppError("Chỉ được chỉnh dịch vụ sau khi khách đã check-in", 400);
  }
  if (services.length !== uniqueIds.length) throw new AppError("Có dịch vụ không tồn tại", 404);
  const map = new Map(services.map((item) => [String(item._id), item]));
  appointment.services = uniqueIds.map((id) => {
    const item = map.get(id)!;
    return { service: item._id, nameSnapshot: item.name, priceSnapshot: item.price, durationSnapshot: item.durationMinutes };
  });
  appointment.subtotal = services.reduce((sum, item) => sum + item.price, 0);
  appointment.discountAmount = Math.round(appointment.subtotal * appointment.discountPercent / 100);
  appointment.totalPrice = appointment.subtotal - appointment.discountAmount;
  appointment.depositRequired = appointment.totalPrice > 200000;
  appointment.depositAmount = appointment.depositRequired ? Math.round(appointment.totalPrice * 0.3) : 0;
  appointment.durationMinutes = services.reduce((sum, item) => sum + item.durationMinutes, 0);
  const endMinutes = timeToMinutes(appointment.startTime) + appointment.durationMinutes;
  appointment.endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  await appointment.save();
  return getAdminAppointmentDetail(appointmentId);
};

export const deleteAdminAppointment = async (appointmentId: string) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  const appointment = await Appointment.findById(appointmentId).select("appointmentCode");
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);

  await Promise.all([
    Payment.deleteMany({ appointment: appointment._id }),
    Review.deleteMany({ appointment: appointment._id }),
  ]);
  await appointment.deleteOne();

  return { id: appointmentId, appointmentCode: appointment.appointmentCode };
};
