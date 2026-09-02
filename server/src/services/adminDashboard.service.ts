import Appointment from "../models/Appointment";
import Service from "../models/Service";
import User from "../models/User";
import mongoose from "mongoose";

interface RevenuePoint {
  date: string;
  revenue: number;
  completedAppointments: number;
}

interface AdminDashboardStatistics {
  totalUsers: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;

  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  inProgressAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;

  todayAppointments: number;
  todayRevenue: number;
  totalRevenue: number;
}

const getDateString = (
  date: Date
): string => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLastSevenDates =
  (): string[] => {
    const dates: string[] = [];

    for (
      let offset = 6;
      offset >= 0;
      offset -= 1
    ) {
      const date = new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() - offset
      );

      dates.push(
        getDateString(date)
      );
    }

    return dates;
  };

export const getAdminDashboard =
  async (filters: { period?: "DAY" | "MONTH" | "YEAR"; date?: string; fromDate?: string; toDate?: string; barberId?: string } = {}) => {
    const today =
      getDateString(new Date());

    const [
      totalUsers,
      totalClients,
      totalBarbers,
      totalServices,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      inProgressAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
      todayCompletedPaidAppointments,
      allCompletedPaidAppointments,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "CLIENT",
      }),

      User.countDocuments({
        role: "BARBER",
      }),

      Service.countDocuments({
        isActive: true,
      }),

      Appointment.countDocuments(),

      Appointment.countDocuments({
        status: "PENDING",
      }),

      Appointment.countDocuments({
        status: "CONFIRMED",
      }),

      Appointment.countDocuments({
        status: "IN_PROGRESS",
      }),

      Appointment.countDocuments({
        status: "COMPLETED",
      }),

      Appointment.countDocuments({
        status: "CANCELLED",
      }),

      Appointment.countDocuments({
        appointmentDate: today,
      }),

      Appointment.find({
        appointmentDate: today,
        status: "COMPLETED",
        paymentStatus: "PAID",
      })
        .select("totalPrice")
        .lean(),

      Appointment.find({
        status: "COMPLETED",
        paymentStatus: "PAID",
      })
        .select("totalPrice")
        .lean(),

      Appointment.find()
        .populate(
          "client",
          "_id fullName email phone"
        )
        .populate(
          "barber",
          "_id fullName email phone"
        )
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .lean(),
    ]);

    const todayRevenue =
      todayCompletedPaidAppointments.reduce(
        (
          total,
          appointment
        ) =>
          total +
          appointment.totalPrice,
        0
      );

    const totalRevenue =
      allCompletedPaidAppointments.reduce(
        (
          total,
          appointment
        ) =>
          total +
          appointment.totalPrice,
        0
      );

    const statistics: AdminDashboardStatistics = {
      totalUsers,
      totalClients,
      totalBarbers,
      totalServices,

      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      inProgressAppointments,
      completedAppointments,
      cancelledAppointments,

      todayAppointments,
      todayRevenue,
      totalRevenue,
    };

    const lastSevenDates =
      getLastSevenDates();

    const sevenDayAppointments =
      await Appointment.find({
        appointmentDate: {
          $in: lastSevenDates,
        },
        status: "COMPLETED",
        paymentStatus: "PAID",
      })
        .select(
          "appointmentDate totalPrice"
        )
        .lean();

    const revenueMap =
      new Map<
        string,
        RevenuePoint
      >();

    for (const date of lastSevenDates) {
      revenueMap.set(date, {
        date,
        revenue: 0,
        completedAppointments: 0,
      });
    }

    for (
      const appointment of
      sevenDayAppointments
    ) {
      const current =
        revenueMap.get(
          appointment.appointmentDate
        );

      if (!current) {
        continue;
      }

      current.revenue +=
        appointment.totalPrice;

      current.completedAppointments += 1;
    }

    const revenueLastSevenDays =
      lastSevenDates.map(
        (date) =>
          revenueMap.get(date)!
      );

    const selectedDate = filters.date || today;
    const period = filters.period || "MONTH";
    const dateMatch = filters.fromDate || filters.toDate
      ? { appointmentDate: { ...(filters.fromDate ? { $gte: filters.fromDate } : {}), ...(filters.toDate ? { $lte: filters.toDate } : {}) } }
      : period === "DAY"
      ? { appointmentDate: selectedDate }
      : period === "YEAR"
        ? { appointmentDate: { $regex: `^${selectedDate.slice(0, 4)}` } }
        : { appointmentDate: { $regex: `^${selectedDate.slice(0, 7)}` } };
    const revenueFilter: Record<string, unknown> = {
      status: "COMPLETED",
      paymentStatus: "PAID",
      ...dateMatch,
    };
    const selectedBarberId = filters.barberId && mongoose.Types.ObjectId.isValid(filters.barberId)
      ? new mongoose.Types.ObjectId(filters.barberId)
      : undefined;
    if (selectedBarberId) revenueFilter.$or = [{ barber: selectedBarberId }, { "staffAssignments.barber": selectedBarberId }];
    const outcomeFilter: Record<string, unknown> = {
      status: { $in: ["COMPLETED", "CANCELLED"] },
      ...dateMatch,
    };
    if (selectedBarberId) outcomeFilter.$or = [{ barber: selectedBarberId }, { "staffAssignments.barber": selectedBarberId }];
    const [completedInPeriod, cancelledInPeriod] = await Promise.all([
      Appointment.countDocuments({ ...outcomeFilter, status: "COMPLETED" }),
      Appointment.countDocuments({ ...outcomeFilter, status: "CANCELLED" }),
    ]);
    const outcomeTotal = completedInPeriod + cancelledInPeriod;
    const outcomeSummary = {
      completed: completedInPeriod,
      cancelled: cancelledInPeriod,
      completionRate: outcomeTotal ? Math.round(completedInPeriod * 100 / outcomeTotal) : 0,
      cancellationRate: outcomeTotal ? Math.round(cancelledInPeriod * 100 / outcomeTotal) : 0,
    };
    const rows = await Appointment.find(revenueFilter).select("barber staffAssignments services subtotal totalPrice").lean();
    const byBarber = new Map<string, { revenue: number; appointments: Set<string> }>();
    const byService = new Map<string, { serviceName: string; uses: number; revenue: number }>();
    for (const appointment of rows) {
      const subtotal = appointment.subtotal > 0 ? appointment.subtotal : appointment.totalPrice;
      for (const service of appointment.services) {
        const serviceId = String(service.service);
        const assignment = appointment.staffAssignments?.find((item) => item.serviceIds.some((id) => String(id) === serviceId));
        const barberId = String(assignment?.barber || appointment.barber);
        if (selectedBarberId && barberId !== String(selectedBarberId)) continue;
        const amount = subtotal > 0 ? appointment.totalPrice * service.priceSnapshot / subtotal : 0;
        const barberRow = byBarber.get(barberId) || { revenue: 0, appointments: new Set<string>() };
        barberRow.revenue += amount; barberRow.appointments.add(String(appointment._id)); byBarber.set(barberId, barberRow);
        const serviceRow = byService.get(serviceId) || { serviceName: service.nameSnapshot || "Dịch vụ", uses: 0, revenue: 0 };
        serviceRow.uses += 1; serviceRow.revenue += amount; byService.set(serviceId, serviceRow);
      }
    }
    const revenueRows = [...byBarber.entries()].map(([barberId, value]) => ({ _id: barberId, revenue: Math.round(value.revenue), appointments: value.appointments.size })).sort((a, b) => b.revenue - a.revenue);
    const serviceRows = [...byService.entries()].map(([serviceId, value]) => ({ _id: serviceId, ...value, revenue: Math.round(value.revenue) })).sort((a, b) => b.uses - a.uses || b.revenue - a.revenue);
    const barberUsers = await User.find({ _id: { $in: revenueRows.map((row) => row._id) } }).select("fullName").lean();
    const barberMap = new Map(barberUsers.map((barber) => [String(barber._id), barber.fullName]));
    const revenueByBarber = revenueRows.map((row) => ({
      barberId: String(row._id),
      barberName: barberMap.get(String(row._id)) || "Barber",
      revenue: row.revenue,
      appointments: row.appointments,
    }));

    return {
      date: today,
      statistics,
      revenueLastSevenDays,
      recentAppointments,
      revenueByBarber,
      revenueByService: serviceRows.map((row) => ({ serviceId: String(row._id), serviceName: row.serviceName || "Dịch vụ", uses: row.uses, revenue: Math.round(row.revenue) })),
      revenueFilter: { period, date: selectedDate, fromDate: filters.fromDate || "", toDate: filters.toDate || "", barberId: filters.barberId || "" },
      outcomeSummary,
    };
  };
