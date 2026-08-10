import mongoose from "mongoose";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";
import Appointment from "../models/Appointment";
import BarberScheduleOverride from "../models/BarberScheduleOverride";

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
  const barbers = await User.find({ role: "BARBER", status: "ACTIVE" }).select("fullName email phone").lean();
  const schedules = await BarberSchedule.find({ barber: { $in: barbers.map((b) => b._id) } }).lean();
  return barbers.map((barber) => ({
    barber,
    schedules: schedules.filter((schedule) => String(schedule.barber) === String(barber._id)),
  }));
};

export const updateBarberSchedule = async (
  barberId: string,
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }>
) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  const barber = await User.findOne({ _id: barberId, role: "BARBER" });
  if (!barber) throw new AppError("Không tìm thấy Barber", 404);
  if (!Array.isArray(schedules) || schedules.length !== 7) throw new AppError("Cần gửi đủ lịch 7 ngày", 400);
  await Promise.all(schedules.map((item) => BarberSchedule.findOneAndUpdate(
    { barber: barberId, dayOfWeek: item.dayOfWeek },
    { $set: { barber: barberId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, isWorking: item.isWorking, breaks: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));
  return BarberSchedule.find({ barber: barberId }).sort({ dayOfWeek: 1 }).lean();
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
  payload: { date: string; startTime: string; endTime: string; isWorking: boolean; note?: string }
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
  return BarberScheduleOverride.findOneAndUpdate(
    { barber: barberId, date: payload.date },
    { $set: { barber: barberId, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, isWorking: payload.isWorking, note: payload.note?.trim() || "" } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
};

export const deleteDateOverride = async (barberId: string, date: string) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) throw new AppError("Mã Barber không hợp lệ", 400);
  assertDate(date);
  await BarberScheduleOverride.deleteOne({ barber: barberId, date });
};
