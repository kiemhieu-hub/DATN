import mongoose from "mongoose";
import Appointment, { type AppointmentStatus } from "../models/Appointment";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";
import Service from "../models/Service";
import { processAutomaticAppointmentStatuses, updateAppointmentStatus } from "./appointment.service";
import Payment from "../models/Payment";
import Review from "../models/Review";
import {
  deleteAppointmentActivities,
  getAppointmentActivities,
  recordAppointmentActivity,
} from "./appointmentActivity.service";
import {
  sendAppointmentLifecycleEmail,
  type AppointmentEmailEvent,
} from "./email.service";

type StaffRole = "ADMIN" | "RECEPTIONIST";

interface AppointmentEmailSource {
  appointmentCode: string;
  customer: {
    fullName: string;
    email: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  services: Array<{
    nameSnapshot: string;
  }>;
}

const queueLifecycleEmail = (
  appointment: AppointmentEmailSource,
  event: AppointmentEmailEvent,
  message: string,
  barberName?: string
) => {
  void sendAppointmentLifecycleEmail({
    event,
    to: appointment.customer.email,
    customerName: appointment.customer.fullName,
    appointmentCode: appointment.appointmentCode,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    barberName,
    services: appointment.services.map(
      (service) => service.nameSnapshot
    ),
    totalPrice: appointment.totalPrice,
    message,
  }).catch((error: unknown) => {
    console.error(
      `Không thể gửi email ${event}:`,
      error
    );
  });
};

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
  const [item, activities] = await Promise.all([
    populate(Appointment.findById(id)).lean(),
    getAppointmentActivities(id),
  ]);
  if (!item) throw new AppError("Không tìm thấy lịch hẹn", 404);
  return { ...item, activities };
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
  await updateAppointmentStatus({ appointmentId, actorId, actorRole, status, reason });
  const appointment = await getAdminAppointmentDetail(appointmentId);
  const emailEvent =
    status === "CONFIRMED"
      ? "CONFIRMED"
      : status === "CANCELLED"
        ? "CANCELLED"
        : status === "NO_SHOW"
          ? "NO_SHOW"
          : status === "COMPLETED"
            ? "COMPLETED"
            : undefined;

  if (emailEvent) {
    const barberName =
      typeof appointment.barber === "object" &&
      appointment.barber &&
      "fullName" in appointment.barber
        ? String(appointment.barber.fullName)
        : undefined;
    queueLifecycleEmail(
      appointment,
      emailEvent,
      status === "CANCELLED"
        ? `Lịch hẹn đã được hủy. Lý do: ${reason ?? "Không có"}`
        : `Trạng thái lịch hẹn đã chuyển sang ${status}.`,
      barberName
    );
  }

  return appointment;
};

export const reassignAppointmentBarber = async (
  appointmentId: string,
  barberId: string,
  actorId: string,
  actorRole: StaffRole
) => {
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

  const previousBarberId = String(appointment.barber);
  const [previousBarber, nextBarber] = await Promise.all([
    User.findById(previousBarberId).select("fullName").lean(),
    User.findById(barberId).select("fullName").lean(),
  ]);
  appointment.barber = new mongoose.Types.ObjectId(barberId);
  await appointment.save();
  await recordAppointmentActivity({
    appointmentId,
    action: "BARBER_CHANGED",
    description: `Đổi Barber từ ${previousBarber?.fullName ?? "không xác định"} sang ${nextBarber?.fullName ?? "không xác định"}`,
    actorId,
    actorRole,
    metadata: {
      previousBarberId,
      newBarberId: barberId,
    },
  });
  const detail = await getAdminAppointmentDetail(appointmentId);
  queueLifecycleEmail(
    detail,
    "BARBER_CHANGED",
    `Barber phụ trách đã đổi từ ${previousBarber?.fullName ?? "không xác định"} sang ${nextBarber?.fullName ?? "không xác định"}.`,
    nextBarber?.fullName
  );
  return detail;
};

export const rescheduleAppointment = async (
  appointmentId: string,
  appointmentDate: string,
  startTime: string,
  consent: boolean,
  actorId: string,
  actorRole: StaffRole
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
  const previousSchedule = {
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
  };
  appointment.appointmentDate = appointmentDate;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.rescheduleConsent = true;
  if (appointment.status === "NO_SHOW") appointment.status = "CONFIRMED";
  await appointment.save();
  await recordAppointmentActivity({
    appointmentId,
    action: "APPOINTMENT_RESCHEDULED",
    description: `Đổi lịch từ ${previousSchedule.appointmentDate} ${previousSchedule.startTime} sang ${appointmentDate} ${startTime}`,
    actorId,
    actorRole,
    metadata: {
      previousSchedule,
      newSchedule: { appointmentDate, startTime, endTime },
      customerConsent: consent,
    },
  });
  const detail = await getAdminAppointmentDetail(appointmentId);
  queueLifecycleEmail(
    detail,
    "RESCHEDULED",
    `Thời gian cũ: ${previousSchedule.appointmentDate} ${previousSchedule.startTime}–${previousSchedule.endTime}. Thời gian mới được hiển thị bên dưới.`
  );
  return detail;
};

export const reopenNoShowAppointment = async (
  appointmentId: string,
  mode: "CHECK_IN" | "RESCHEDULE",
  appointmentDate?: string,
  startTime?: string,
  barberId?: string,
  actorId?: string,
  actorRole: StaffRole = "ADMIN"
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
    await appointment.save();
    await recordAppointmentActivity({
      appointmentId,
      action: "NO_SHOW_REOPENED_CHECK_IN",
      description: "Đã bật lại lịch vắng mặt và check-in khách hàng",
      actorId,
      actorRole,
      metadata: { newStatus: "CHECKED_IN" },
    });
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

    const previousSchedule = {
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      barberId: String(appointment.barber),
    };
    appointment.appointmentDate = appointmentDate;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.barber = new mongoose.Types.ObjectId(barberId);
    appointment.status = "CONFIRMED";
    appointment.confirmedAt = new Date();
    appointment.reopenedAt = new Date();
    appointment.rescheduleConsent = true;
    await appointment.save();
    await recordAppointmentActivity({
      appointmentId,
      action: "NO_SHOW_REOPENED_RESCHEDULED",
      description: `Bật lại lịch vắng mặt và đặt lại sang ${appointmentDate} ${startTime}`,
      actorId,
      actorRole,
      metadata: {
        previousSchedule,
        newSchedule: {
          appointmentDate,
          startTime,
          endTime,
          barberId,
        },
        newStatus: "CONFIRMED",
      },
    });
  } else {
    throw new AppError("Phương thức bật lại lịch không hợp lệ", 400);
  }

  const detail = await getAdminAppointmentDetail(appointmentId);
  const barberName =
    typeof detail.barber === "object" &&
    detail.barber &&
    "fullName" in detail.barber
      ? String(detail.barber.fullName)
      : undefined;
  queueLifecycleEmail(
    detail,
    "REOPENED",
    mode === "CHECK_IN"
      ? "Lịch vắng mặt đã được bật lại và khách hàng được check-in."
      : "Lịch vắng mặt đã được bật lại với ngày giờ mới.",
    barberName
  );
  return detail;
};

export const replaceAppointmentServices = async (
  appointmentId: string,
  serviceIds: string[],
  actorId: string,
  actorRole: StaffRole
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
  const previousServices = appointment.services.map((item) => ({
    serviceId: String(item.service),
    name: item.nameSnapshot,
    price: item.priceSnapshot,
  }));
  const previousTotal = appointment.totalPrice;
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
  await recordAppointmentActivity({
    appointmentId,
    action: "SERVICES_CHANGED",
    description: `Cập nhật dịch vụ: ${previousServices.map((item) => item.name).join(", ")} → ${appointment.services.map((item) => item.nameSnapshot).join(", ")}`,
    actorId,
    actorRole,
    metadata: {
      previousServices,
      newServices: appointment.services.map((item) => ({
        serviceId: String(item.service),
        name: item.nameSnapshot,
        price: item.priceSnapshot,
      })),
      previousTotal,
      newTotal: appointment.totalPrice,
    },
  });
  return getAdminAppointmentDetail(appointmentId);
};

export const deleteAdminAppointment = async (appointmentId: string) => {
  assertId(appointmentId, "Mã lịch hẹn không hợp lệ");
  const appointment = await Appointment.findById(appointmentId).select("appointmentCode");
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);

  await Promise.all([
    Payment.deleteMany({ appointment: appointment._id }),
    Review.deleteMany({ appointment: appointment._id }),
    deleteAppointmentActivities(appointment._id),
  ]);
  await appointment.deleteOne();

  return { id: appointmentId, appointmentCode: appointment.appointmentCode };
};
