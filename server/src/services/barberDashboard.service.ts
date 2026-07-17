import mongoose from "mongoose";

import Appointment, {
  type AppointmentStatus,
} from "../models/Appointment";

import User from "../models/User";
import AppError from "../utils/AppError";

interface DashboardStatistics {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  todayRevenue: number;
}

interface DashboardAppointmentService {
  name: string;
  price: number;
  durationMinutes: number;
}

interface DashboardAppointment {
  _id: string;

  client: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;

  services: DashboardAppointmentService[];

  appointmentDate: string;
  startTime: string;
  endTime: string;

  durationMinutes: number;
  totalPrice: number;

  status: AppointmentStatus;
}

interface BarberDashboardResult {
  date: string;
  statistics: DashboardStatistics;
  nextAppointment: DashboardAppointment | null;
  todayAppointments: DashboardAppointment[];
}

const ACTIVE_NEXT_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
];

const assertObjectId = (
  value: string,
  message: string
): void => {
  if (
    typeof value !== "string" ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new AppError(message, 400);
  }
};

const getTodayString = (): string => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const timeToMinutes = (
  time: string
): number => {
  const [hourText, minuteText] =
    time.split(":");

  const hours = Number(hourText);
  const minutes = Number(minuteText);

  return hours * 60 + minutes;
};

const getCurrentMinutes = (): number => {
  const now = new Date();

  return (
    now.getHours() * 60 +
    now.getMinutes()
  );
};

const validateBarberAccount = async (
  barberId: string
): Promise<void> => {
  assertObjectId(
    barberId,
    "Tài khoản Barber không hợp lệ"
  );

  const barber = await User.findOne({
    _id: barberId,
    role: "BARBER",
    status: "ACTIVE",
  }).select("_id");

  if (!barber) {
    throw new AppError(
      "Không tìm thấy tài khoản Barber đang hoạt động",
      404
    );
  }
};

const normalizeAppointment = (
  appointment: any
): DashboardAppointment => {
  const populatedClient =
    appointment.client &&
    typeof appointment.client === "object"
      ? {
          _id: String(
            appointment.client._id
          ),

          fullName:
            appointment.client.fullName,

          email:
            appointment.client.email,

          phone:
            appointment.client.phone,
        }
      : null;

  return {
    _id: String(appointment._id),

    client: populatedClient,

    services:
      Array.isArray(
        appointment.services
      )
        ? appointment.services.map(
            (serviceItem: any) => ({
              name:
                serviceItem.nameSnapshot,

              price:
                serviceItem.priceSnapshot,

              durationMinutes:
                serviceItem.durationSnapshot,
            })
          )
        : [],

    appointmentDate:
      appointment.appointmentDate,

    startTime:
      appointment.startTime,

    endTime:
      appointment.endTime,

    durationMinutes:
      appointment.durationMinutes,

    totalPrice:
      appointment.totalPrice,

    status:
      appointment.status,
  };
};

/**
 * Lấy dữ liệu Dashboard của Barber trong ngày hiện tại.
 */
export const getBarberDashboard =
  async (
    barberId: string
  ): Promise<BarberDashboardResult> => {
    await validateBarberAccount(
      barberId
    );

    const today = getTodayString();

    const appointments =
      await Appointment.find({
        barber: barberId,
        appointmentDate: today,
      })
        .populate(
          "client",
          "_id fullName email phone"
        )
        .sort({
          startTime: 1,
        })
        .lean();

    const statistics: DashboardStatistics = {
      total: appointments.length,

      pending: 0,

      confirmed: 0,

      inProgress: 0,

      completed: 0,

      cancelled: 0,

      todayRevenue: 0,
    };

    for (const appointment of appointments) {
      switch (appointment.status) {
        case "PENDING":
          statistics.pending += 1;
          break;

        case "CONFIRMED":
          statistics.confirmed += 1;
          break;

        case "IN_PROGRESS":
          statistics.inProgress += 1;
          break;

        case "COMPLETED":
          statistics.completed += 1;

          if (
            appointment.paymentStatus ===
            "PAID"
          ) {
            statistics.todayRevenue +=
              appointment.totalPrice;
          }

          break;

        case "CANCELLED":
          statistics.cancelled += 1;
          break;

        default:
          break;
      }
    }

    const currentMinutes =
      getCurrentMinutes();

    const nextAppointment =
      appointments.find(
        (appointment) => {
          if (
            !ACTIVE_NEXT_APPOINTMENT_STATUSES.includes(
              appointment.status
            )
          ) {
            return false;
          }

          const appointmentEnd =
            timeToMinutes(
              appointment.endTime
            );

          return (
            appointmentEnd >=
            currentMinutes
          );
        }
      );

    return {
      date: today,

      statistics,

      nextAppointment:
        nextAppointment
          ? normalizeAppointment(
              nextAppointment
            )
          : null,

      todayAppointments:
        appointments.map(
          normalizeAppointment
        ),
    };
  };