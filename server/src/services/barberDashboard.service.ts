import mongoose from "mongoose";

import Appointment, { type AppointmentStatus } from "../models/Appointment";
import User from "../models/User";
import AppError from "../utils/AppError";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const localDate = (date = new Date()) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

const normalizeAppointment = (appointment: any, barberId: string) => {
  const assignment = appointment.staffAssignments?.find(
    (item: any) => String(item.barber?._id ?? item.barber) === barberId
  );

  return {
    _id: String(appointment._id),
    appointmentCode: appointment.appointmentCode,
    client: appointment.client && typeof appointment.client === "object"
      ? {
          _id: String(appointment.client._id),
          fullName: appointment.client.fullName,
          email: appointment.client.email,
          phone: appointment.client.phone,
        }
      : null,
    services: (appointment.services ?? []).map((item: any) => ({
      name: item.nameSnapshot,
      price: item.priceSnapshot,
      durationMinutes: item.durationSnapshot,
    })),
    appointmentDate: appointment.appointmentDate,
    startTime: assignment?.startTime ?? appointment.startTime,
    endTime: assignment?.endTime ?? appointment.endTime,
    durationMinutes: appointment.durationMinutes,
    totalPrice: appointment.finalPrice ?? appointment.totalPrice,
    status: appointment.status as AppointmentStatus,
    paymentStatus: appointment.paymentStatus,
    barberViewedAt: appointment.barberViewedAt,
  };
};

export const getBarberDashboard = async (
  barberId: string,
  dateFrom?: string,
  dateTo?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    throw new AppError("Tài khoản Barber không hợp lệ", 400);
  }

  const barber = await User.findOne({ _id: barberId, role: "BARBER", status: "ACTIVE" });
  if (!barber) throw new AppError("Không tìm thấy Barber đang hoạt động", 404);

  const today = localDate();
  const from = dateFrom && DATE_PATTERN.test(dateFrom) ? dateFrom : today;
  const to = dateTo && DATE_PATTERN.test(dateTo) ? dateTo : from;
  if (from > to) throw new AppError("Khoảng ngày không hợp lệ", 400);

  const appointments = await Appointment.find({
    $or: [{ barber: barberId }, { "staffAssignments.barber": barberId }],
    appointmentDate: { $gte: from, $lte: to },
  })
    .populate("client", "_id fullName email phone")
    .populate("staffAssignments.barber", "_id fullName")
    .sort({ appointmentDate: 1, startTime: 1 })
    .lean();

  const revenueByDate = new Map<string, number>();
  let completed = 0;
  let cancelled = 0;
  let noShow = 0;
  let revenue = 0;

  for (const appointment of appointments) {
    if (appointment.status === "COMPLETED") completed += 1;
    if (appointment.status === "CANCELLED") cancelled += 1;
    if (appointment.status === "NO_SHOW") noShow += 1;

    if (appointment.status === "COMPLETED" && appointment.paymentStatus === "PAID") {
      const value = appointment.finalPrice ?? appointment.totalPrice;
      revenue += value;
      revenueByDate.set(
        appointment.appointmentDate,
        (revenueByDate.get(appointment.appointmentDate) ?? 0) + value
      );
    }
  }

  const resolved = completed + cancelled + noShow;
  return {
    dateFrom: from,
    dateTo: to,
    today,
    revenue,
    revenueSeries: Array.from({ length: Math.floor((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86400000) + 1 }, (_, index) => {
      const date = new Date(`${from}T00:00:00`);
      date.setDate(date.getDate() + index);
      const key = localDate(date);
      return { date: key, amount: revenueByDate.get(key) ?? 0 };
    }),
    outcomes: {
      completed,
      cancelled,
      noShow,
      completionRate: resolved ? Math.round((completed / resolved) * 100) : 0,
      cancellationRate: resolved ? Math.round(((cancelled + noShow) / resolved) * 100) : 0,
    },
    appointments: appointments.map((item) => normalizeAppointment(item, barberId)),
  };
};
