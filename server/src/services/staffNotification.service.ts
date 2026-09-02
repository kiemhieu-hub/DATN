import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import StaffNotification, {
  type StaffNotificationKind,
} from "../models/StaffNotification";
import AppError from "../utils/AppError";
import { getVietnamDateString, parseVietnamDateTime } from "../utils/vietnamTime";

type StaffRole = "ADMIN" | "RECEPTIONIST";

interface CreateNotificationInput {
  title: string;
  message: string;
  kind: StaffNotificationKind;
  appointmentId?: string | mongoose.Types.ObjectId;
  audienceRoles?: StaffRole[];
  dedupeKey?: string;
}

export const createStaffNotification = async (
  input: CreateNotificationInput
) => {
  const data = {
    title: input.title,
    message: input.message,
    kind: input.kind,
    appointment: input.appointmentId,
    audienceRoles:
      input.audienceRoles ?? [
        "ADMIN",
        "RECEPTIONIST",
      ],
    dedupeKey: input.dedupeKey,
  };

  if (input.dedupeKey) {
    return StaffNotification.findOneAndUpdate(
      { dedupeKey: input.dedupeKey },
      { $setOnInsert: data },
      { new: true, upsert: true }
    );
  }

  return StaffNotification.create(data);
};

export const getStaffNotifications = async (
  userId: string,
  role: StaffRole,
  unreadOnly = false
) => {
  const filter: Record<string, unknown> = {
    audienceRoles: role,
  };
  if (unreadOnly) {
    filter.readBy = {
      $ne: new mongoose.Types.ObjectId(
        userId
      ),
    };
  }

  const [items, unreadCount] =
    await Promise.all([
      StaffNotification.find(filter)
        .populate(
          "appointment",
          "appointmentCode appointmentDate startTime endTime status paymentStatus customer"
        )
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      StaffNotification.countDocuments({
        audienceRoles: role,
        readBy: {
          $ne:
            new mongoose.Types.ObjectId(
              userId
            ),
        },
      }),
    ]);

  return {
    items: items.map((item) => ({
      ...item,
      isRead: item.readBy.some(
        (id) => String(id) === userId
      ),
    })),
    unreadCount,
  };
};

export const markNotificationRead = async (
  notificationId: string,
  userId: string,
  role: StaffRole
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      notificationId
    )
  ) {
    throw new AppError(
      "Mã thông báo không hợp lệ",
      400
    );
  }

  const notification =
    await StaffNotification.findOneAndUpdate(
      {
        _id: notificationId,
        audienceRoles: role,
      },
      {
        $addToSet: {
          readBy:
            new mongoose.Types.ObjectId(
              userId
            ),
        },
      },
      { new: true }
    );

  if (!notification) {
    throw new AppError(
      "Không tìm thấy thông báo",
      404
    );
  }

  return notification;
};

export const markAllNotificationsRead =
  async (
    userId: string,
    role: StaffRole
  ) =>
    StaffNotification.updateMany(
      { audienceRoles: role },
      {
        $addToSet: {
          readBy:
            new mongoose.Types.ObjectId(
              userId
            ),
        },
      }
    );

export const createUpcomingNotifications =
  async () => {
    const now = new Date();
    const upcomingLimit = new Date(
      now.getTime() + 30 * 60 * 1000
    );
    const today = getVietnamDateString(now);

    const appointments =
      await Appointment.find({
        appointmentDate: today,
        status: {
          $in: ["CONFIRMED", "CHECKED_IN"],
        },
      }).select(
        "appointmentCode customer appointmentDate startTime"
      );

    const upcoming = appointments.filter(
      (appointment) => {
        const startsAt = parseVietnamDateTime(appointment.appointmentDate, appointment.startTime);
        return (
          startsAt > now &&
          startsAt <= upcomingLimit
        );
      }
    );

    await Promise.all(
      upcoming.map((appointment) =>
        createStaffNotification({
          title: "Lịch hẹn sắp bắt đầu",
          message: `${appointment.customer.fullName} có lịch ${appointment.appointmentCode} lúc ${appointment.startTime}.`,
          kind: "UPCOMING",
          appointmentId: appointment._id,
          dedupeKey: `UPCOMING:${appointment._id}:${appointment.appointmentDate}:${appointment.startTime}`,
        })
      )
    );

    return upcoming.length;
  };
