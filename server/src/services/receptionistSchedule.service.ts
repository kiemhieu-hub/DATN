import mongoose from "mongoose";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";
import Appointment from "../models/Appointment";
import BarberScheduleOverride from "../models/BarberScheduleOverride";
import BarberProfile from "../models/BarberProfile";
import BarberScheduleChangeLog from "../models/BarberScheduleChangeLog";
import BarberLeaveRequest from "../models/BarberLeaveRequest";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];
const timeToMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};
const minutesToTime = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const getDayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

const assertDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError("Ngày xem lịch không hợp lệ", 400);
};

const assertTimes = (startTime: string, endTime: string, isWorking: boolean) => {
  if (!isWorking) return;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
    throw new AppError("Khung giờ làm việc không hợp lệ", 400);
  }
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new AppError("Giờ kết thúc phải sau giờ bắt đầu", 400);
  }
};

export const listBarberSchedules = async () => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // Lịch riêng đã qua không còn giá trị sử dụng nên được dọn tự động.
  await BarberScheduleOverride.deleteMany({ date: { $lt: today } });

  const barbers = await User.find({ role: "BARBER", status: "ACTIVE" }).select("fullName email phone").lean();
  const profiles = await BarberProfile.find({ user: { $in: barbers.map((b) => b._id) }, isActive: true }).select("user staffType").lean();
  const staffTypeByUser = new Map(profiles.map((profile) => [String(profile.user), profile.staffType]));
  const barberIds = barbers.map((barber) => barber._id);
  const [schedules, dateOverrides] = await Promise.all([
    BarberSchedule.find({ barber: { $in: barberIds } }).lean(),
    BarberScheduleOverride.find({
      barber: { $in: barberIds },
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .lean(),
  ]);

  return barbers.map((barber) => ({
    barber: { ...barber, staffType: staffTypeByUser.get(String(barber._id)) || "HAIR" },
    schedules: schedules.filter((schedule) => String(schedule.barber) === String(barber._id)),
    dateOverrides: dateOverrides.filter(
      (override) => String(override.barber) === String(barber._id)
    ),
  }));
};

export const updateBarberSchedule = async (
  barberId: string,
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }>,
  actorId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  const barber = await User.findOne({ _id: barberId, role: "BARBER" });
  if (!barber) throw new AppError("Không tìm thấy Barber", 404);
  if (!Array.isArray(schedules) || schedules.length !== 7) throw new AppError("Cần gửi đủ lịch 7 ngày", 400);
  const previousSchedules = await BarberSchedule.find({ barber: barberId })
    .sort({ dayOfWeek: 1 })
    .lean();

  await Promise.all(schedules.map((item) => BarberSchedule.findOneAndUpdate(
    { barber: barberId, dayOfWeek: item.dayOfWeek },
    { $set: { barber: barberId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, isWorking: item.isWorking, breaks: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));
  const updatedSchedules = await BarberSchedule.find({ barber: barberId })
    .sort({ dayOfWeek: 1 })
    .lean();

  await BarberScheduleChangeLog.create({
    barber: barberId,
    actor: actorId,
    changeType: "WEEKLY_UPDATED",
    before: previousSchedules,
    after: updatedSchedules,
    note: "Cập nhật lịch làm việc lặp hằng tuần",
  });

  return updatedSchedules;
};

export const getBarberDayDetail = async (barberId: string, date: string) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  assertDate(date);
  const barber = await User.findOne({ _id: barberId, role: "BARBER", status: "ACTIVE" })
    .select("fullName email phone").lean();
  if (!barber) throw new AppError("Không tìm thấy Barber", 404);

  const [weekly, override, appointments] = await Promise.all([
    BarberSchedule.findOne({ barber: barberId, dayOfWeek: getDayOfWeek(date) }).lean(),
    BarberScheduleOverride.findOne({ barber: barberId, date }).lean(),
    Appointment.find({
      appointmentDate: date,
      status: { $in: ACTIVE_STATUSES },
      $or: [{ barber: barberId }, { "staffAssignments.barber": barberId }],
    } as any).select("appointmentCode customer startTime endTime status staffAssignments barber services").lean(),
  ]);

  const schedule = override || weekly;
  const source = override ? "OVERRIDE" : "WEEKLY";
  const intervals = appointments.flatMap((appointment) => {
    const assignments = appointment.staffAssignments?.filter(
      (assignment) => String(assignment.barber) === barberId
    ) || [];
    if (assignments.length) {
      return assignments.map((assignment) => ({
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        appointmentId: String(appointment._id),
        appointmentCode: appointment.appointmentCode,
        customerName: appointment.customer?.fullName || "Khách hàng",
        status: appointment.status,
      }));
    }
    if (String(appointment.barber) !== barberId) return [];
    return [{
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      appointmentId: String(appointment._id),
      appointmentCode: appointment.appointmentCode,
      customerName: appointment.customer?.fullName || "Khách hàng",
      status: appointment.status,
    }];
  });

  const slots: Array<Record<string, unknown>> = [];
  if (schedule?.isWorking) {
    for (let cursor = timeToMinutes(schedule.startTime); cursor < timeToMinutes(schedule.endTime); cursor += 30) {
      const slotEnd = Math.min(cursor + 30, timeToMinutes(schedule.endTime));
      const booking = intervals.find((item) =>
        cursor < timeToMinutes(item.endTime) && slotEnd > timeToMinutes(item.startTime)
      );
      slots.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(slotEnd), booked: Boolean(booking), booking });
    }
  }

  return { barber, date, source, schedule: schedule ? {
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    isWorking: schedule.isWorking,
    note: "note" in schedule ? schedule.note : "",
  } : null, slots };
};

export const saveDateOverride = async (
  barberId: string,
  payload: { date: string; startTime: string; endTime: string; isWorking: boolean; note?: string },
  actorId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  assertDate(payload.date);
  assertTimes(payload.startTime, payload.endTime, payload.isWorking);
  const barber = await User.exists({ _id: barberId, role: "BARBER", status: "ACTIVE" });
  if (!barber) throw new AppError("Không tìm thấy Barber", 404);
  const appointments = await Appointment.find({
    appointmentDate: payload.date,
    status: { $in: ACTIVE_STATUSES },
    $or: [{ barber: barberId }, { "staffAssignments.barber": barberId }],
  } as any).select("appointmentCode startTime endTime staffAssignments barber").lean();
  const assignedIntervals = appointments.flatMap((appointment) => {
    const assigned = appointment.staffAssignments?.filter((item) => String(item.barber) === barberId) || [];
    if (assigned.length) return assigned.map((item) => ({ startTime:item.startTime,endTime:item.endTime,code:appointment.appointmentCode }));
    return String(appointment.barber) === barberId
      ? [{ startTime:appointment.startTime,endTime:appointment.endTime,code:appointment.appointmentCode }]
      : [];
  });
  const conflicting = assignedIntervals.find((item) => !payload.isWorking ||
    timeToMinutes(item.startTime) < timeToMinutes(payload.startTime) ||
    timeToMinutes(item.endTime) > timeToMinutes(payload.endTime));
  if (conflicting) {
    throw new AppError(`Không thể đổi ca vì lịch ${conflicting.code} nằm ngoài khung giờ mới. Hãy đổi lịch hẹn trước.`, 409);
  }
  const previousOverride = await BarberScheduleOverride.findOne({
    barber: barberId,
    date: payload.date,
  }).lean();

  const savedOverride = await BarberScheduleOverride.findOneAndUpdate(
    { barber: barberId, date: payload.date },
    { $set: { barber: barberId, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, isWorking: payload.isWorking, note: payload.note?.trim() || "" } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  await BarberScheduleChangeLog.create({
    barber: barberId,
    actor: actorId,
    changeType: "DATE_OVERRIDE_SAVED",
    effectiveDate: payload.date,
    before: previousOverride,
    after: savedOverride,
    note: payload.note?.trim() || "Cập nhật lịch làm việc theo ngày",
  });

  return savedOverride;
};

export const deleteDateOverride = async (
  barberId: string,
  date: string,
  actorId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  assertDate(date);
  const previousOverride = await BarberScheduleOverride.findOne({
    barber: barberId,
    date,
  }).lean();

  await BarberScheduleOverride.deleteOne({ barber: barberId, date });

  if (previousOverride) {
    await BarberScheduleChangeLog.create({
      barber: barberId,
      actor: actorId,
      changeType: "DATE_OVERRIDE_REMOVED",
      effectiveDate: date,
      before: previousOverride,
      after: null,
      note: "Hủy lịch điều chỉnh theo ngày",
    });
  }
};

export const getScheduleChangeHistory = async (barberId: string) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    throw new AppError("Mã Barber không hợp lệ", 400);
  }

  const barber = await User.exists({ _id: barberId, role: "BARBER" });
  if (!barber) throw new AppError("Không tìm thấy Barber", 404);

  return BarberScheduleChangeLog.find({ barber: barberId })
    .populate("actor", "fullName role")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
};

export const listLeaveRequests = async () =>
  BarberLeaveRequest.find()
    .populate("barber", "fullName email phone")
    .populate("reviewedBy", "fullName role")
    .sort({ status: 1, createdAt: -1 })
    .limit(200)
    .lean();

export const reviewLeaveRequest = async (
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  reviewNote: string,
  actorId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) throw new AppError("Mã yêu cầu không hợp lệ", 400);
  if (!["APPROVED", "REJECTED"].includes(decision)) throw new AppError("Quyết định xử lý không hợp lệ", 400);
  const request = await BarberLeaveRequest.findById(requestId);
  if (!request) throw new AppError("Không tìm thấy yêu cầu nghỉ", 404);
  if (request.status !== "PENDING") throw new AppError("Yêu cầu này đã được xử lý", 409);

  if (decision === "APPROVED") {
    const conflict = await Appointment.findOne({
      appointmentDate: { $gte: request.startDate, $lte: request.endDate },
      status: { $in: ACTIVE_STATUSES },
      $or: [{ barber: request.barber }, { "staffAssignments.barber": request.barber }],
    } as any).select("appointmentCode appointmentDate").lean();
    if (conflict) {
      throw new AppError(`Không thể duyệt vì Barber có lịch ${conflict.appointmentCode} ngày ${conflict.appointmentDate}`, 409);
    }

    const dates: string[] = [];
    for (let date = new Date(`${request.startDate}T00:00:00Z`); date <= new Date(`${request.endDate}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1)) {
      dates.push(date.toISOString().slice(0, 10));
    }
    await BarberScheduleOverride.bulkWrite(dates.map((date) => ({
      updateOne: {
        filter: { barber: request.barber, date },
        update: { $set: { barber: request.barber, date, startTime: "09:00", endTime: "21:00", isWorking: false, note: `${request.reasonType}${request.note ? `: ${request.note}` : ""}` } },
        upsert: true,
      },
    })));
  }

  request.status = decision;
  request.reviewedBy = new mongoose.Types.ObjectId(actorId);
  request.reviewNote = reviewNote.trim();
  request.reviewedAt = new Date();
  await request.save();
  return request.populate([{ path: "barber", select: "fullName email phone" }, { path: "reviewedBy", select: "fullName role" }]);
};
