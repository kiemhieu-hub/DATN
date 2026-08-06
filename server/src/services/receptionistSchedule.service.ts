import mongoose from "mongoose";
import BarberSchedule from "../models/BarberSchedule";
import User from "../models/User";
import AppError from "../utils/AppError";

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
