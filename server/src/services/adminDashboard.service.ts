import Appointment from "../models/Appointment";
import Service from "../models/Service";
import User from "../models/User";

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
  async () => {
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

    return {
      date: today,
      statistics,
      revenueLastSevenDays,
      recentAppointments,
    };
  };