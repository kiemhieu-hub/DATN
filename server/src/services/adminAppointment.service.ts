import mongoose from "mongoose";
import Appointment, { type AppointmentStatus } from "../models/Appointment";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";
import Service from "../models/Service";
import { processAutomaticAppointmentStatuses, updateAppointmentStatus } from "./appointment.service";
import Payment from "../models/Payment";
import Review from "../models/Review";

interface ListInput {
  keyword?: string;
  status?: AppointmentStatus | "ALL";
  barberId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  sortOrder?: "priority" | "newest" | "oldest";
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

type SortableAppointment = {
  status: AppointmentStatus;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED";
  appointmentDate: string;
  startTime: string;
};

const appointmentTimestamp = (item: SortableAppointment) =>
  new Date(`${item.appointmentDate}T${item.startTime}:00`).getTime();

const priorityRank = (item: SortableAppointment) => {
  if (item.status === "COMPLETED" && ["UNPAID", "PENDING"].includes(item.paymentStatus)) return 0;
  if (item.status === "PENDING") return 1;
  if (item.status === "IN_PROGRESS") return 2;
  if (item.status === "CHECKED_IN") return 3;
  if (item.status === "CONFIRMED") return 4;
  if (item.status === "NO_SHOW") return 5;
  if (item.status === "COMPLETED") return 6;
  return 7;
};

const sortAppointmentsByPriority = <T extends SortableAppointment>(items: T[]) =>
  items.sort((first, second) => {
    const rankDifference = priorityRank(first) - priorityRank(second);
    if (rankDifference !== 0) return rankDifference;

    const firstTime = appointmentTimestamp(first);
    const secondTime = appointmentTimestamp(second);

    // Các nhóm cần xử lý/sắp tới: thời gian gần nhất đứng trước.
    if (priorityRank(first) <= 4) return firstTime - secondTime;

    // Nhóm lịch đã kết thúc: bản ghi gần đây đứng trước.
    return secondTime - firstTime;
  });

const assertBarberAvailability = async (
  barberId: string,
  appointmentId: string,
  appointmentDate: string,
  startTime: string,
  endTime: string
) => {
  assertId(barberId, "Mã Barber không hợp lệ");
  const barber = await User.findOne({ _id: barberId, role: "BARBER", status: "ACTIVE" }).select("_id");
  if (!barber) throw new AppError("Barber không tồn tại hoặc đã ngừng hoạt động", 404);

  const dayOfWeek = new Date(`${appointmentDate}T00:00:00`).getDay();
  const schedule = await BarberSchedule.findOne({ barber: barberId, dayOfWeek, isWorking: true }).lean();
  if (!schedule) throw new AppError("Barber không làm việc trong ngày đã chọn", 409);

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start < timeToMinutes(schedule.startTime) || end > timeToMinutes(schedule.endTime)) {
    throw new AppError("Lịch hẹn nằm ngoài giờ làm việc của Barber", 409);
  }

  const existing = await Appointment.find({
    _id: { $ne: appointmentId },
    barber: barberId,
    appointmentDate,
    status: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"] },
  }).select("startTime endTime").lean();

  if (existing.some((item) => overlaps(start, end, timeToMinutes(item.startTime), timeToMinutes(item.endTime)))) {
    throw new AppError("Barber đã có lịch trùng khung giờ này", 409);
  }
};

export const listAdminAppointments = async (input: ListInput) => {
  await processAutomaticAppointmentStatuses();
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
  if (input.appointmentTime) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.appointmentTime)) {
      throw new AppError("Giờ hẹn không hợp lệ", 400);
    }
    filter.startTime = input.appointmentTime;
  }
  if (input.keyword?.trim()) {
    const regex = new RegExp(input.keyword.trim(), "i");
    const users = await User.find({
      $or: [{ fullName: regex }, { email: regex }, { phone: regex }],
    }).select("_id").lean();
    filter.client = { $in: users.map((user) => user._id) };
  }

  const sortOrder = input.sortOrder ?? "priority";
  const totalItems = await Appointment.countDocuments(filter);
  let items;

  if (sortOrder === "priority") {
    const allItems = await populate(Appointment.find(filter)).lean();
    const sortedItems = sortAppointmentsByPriority(allItems as SortableAppointment[]);
    const startIndex = (page - 1) * limit;
    items = sortedItems.slice(startIndex, startIndex + limit);
  } else {
    items = await populate(Appointment.find(filter))
      .sort(sortOrder === "oldest"
        ? { appointmentDate: 1, startTime: 1, createdAt: 1 }
        : { appointmentDate: -1, startTime: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

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
  await assertBarberAvailability(
    barberId, appointmentId, appointment.appointmentDate,
    appointment.startTime, appointment.endTime
  );

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

export const reopenNoShowAppointment = async (
  appointmentId: string,
  mode: "CHECK_IN" | "RESCHEDULE",
  appointmentDate?: string,
  startTime?: string,
  barberId?: string
) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);
  if (appointment.status !== "NO_SHOW") throw new AppError("Chỉ được bật lại lịch đang vắng mặt", 400);

  if (mode === "CHECK_IN") {
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const endsAt = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00`);
    if (appointment.appointmentDate !== currentDate || now >= endsAt) {
      throw new AppError("Khung giờ cũ đã kết thúc, vui lòng đặt lại lịch", 409);
    }
    await assertBarberAvailability(
      String(appointment.barber), appointmentId, currentDate,
      currentTime, appointment.endTime
    );
    appointment.status = "CHECKED_IN";
    appointment.checkedInAt = now;
    appointment.reopenedAt = now;
  } else if (mode === "RESCHEDULE") {
    if (!appointmentDate || !startTime || !barberId) {
      throw new AppError("Vui lòng chọn đầy đủ ngày, giờ và Barber mới", 400);
    }
    if (!datePattern.test(appointmentDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      throw new AppError("Ngày hoặc giờ hẹn không hợp lệ", 400);
    }
    const endMinutes = timeToMinutes(startTime) + appointment.durationMinutes;
    if (endMinutes >= 24 * 60) throw new AppError("Thời gian kết thúc không hợp lệ", 400);
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    await assertBarberAvailability(barberId, appointmentId, appointmentDate, startTime, endTime);

    appointment.appointmentDate = appointmentDate;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.barber = new mongoose.Types.ObjectId(barberId);
    appointment.status = "CONFIRMED";
    appointment.confirmedAt = new Date();
    appointment.reopenedAt = new Date();
    appointment.rescheduleConsent = true;
  } else {
    throw new AppError("Phương thức bật lại lịch không hợp lệ", 400);
  }

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
