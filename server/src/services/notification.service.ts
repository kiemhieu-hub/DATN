import mongoose from "mongoose";
import Notification, {
  type INotification,
  type NotificationType,
  type NotificationStatus,
} from "../models/Notification";
import { sendNotificationToUser } from "../socket/socket";

interface CreateNotificationInput {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export const createNotification = async (
  input: CreateNotificationInput
): Promise<INotification> => {
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data || {},
    status: "UNREAD",
  });

  sendNotificationToUser(input.userId, {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data as Record<string, unknown>,
  });

  return notification;
};

export const getNotificationsByUser = async (
  userId: string | mongoose.Types.ObjectId,
  options: {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
  } = {}
) => {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId };

  if (status) {
    query.status = status;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadCount = async (
  userId: string | mongoose.Types.ObjectId
): Promise<number> => {
  return Notification.countDocuments({
    userId,
    status: "UNREAD",
  });
};

export const markAsRead = async (
  notificationId: string
): Promise<INotification | null> => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      status: "READ",
      readAt: new Date(),
    },
    { new: true }
  );

  return notification;
};

export const markAllAsRead = async (
  userId: string | mongoose.Types.ObjectId
): Promise<number> => {
  const result = await Notification.updateMany(
    {
      userId,
      status: "UNREAD",
    },
    {
      status: "READ",
      readAt: new Date(),
    }
  );

  return result.modifiedCount;
};

export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  const result = await Notification.findByIdAndDelete(notificationId);
  return !!result;
};

export const deleteOldNotifications = async (
  daysOld: number = 30
): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: "READ",
  });

  return result.deletedCount;
};

export const sendBookingNotifications = async (
  bookingData: {
    bookingId: string;
    customerName: string;
    barberId: string;
    barberName: string;
    date: string;
    time: string;
    serviceName: string;
  }
) => {
  const { bookingId, customerName, barberId, barberName, date, time, serviceName } = bookingData;

  await Promise.all([
    createNotification({
      userId: barberId,
      type: "BOOKING_NEW",
      title: "Lịch hẹn mới",
      message: `${customerName} đã đặt lịch cắt tóc vào ngày ${date} lúc ${time}. Dịch vụ: ${serviceName}`,
      data: { bookingId },
    }),
    createNotification({
      userId: barberId,
      type: "APPOINTMENT_STARTING",
      title: "Nhắc nhở lịch hẹn",
      message: `Bạn có lịch hẹn với ${customerName} vào ngày mai lúc ${time}`,
      data: { bookingId },
    }),
  ]);
};

export const sendBookingConfirmedNotification = async (
  bookingData: {
    bookingId: string;
    customerId: string;
    barberName: string;
    date: string;
    time: string;
  }
) => {
  await createNotification({
    userId: bookingData.customerId,
    type: "BOOKING_CONFIRMED",
    title: "Lịch hẹn đã được xác nhận",
    message: `Lịch hẹn của bạn với barber ${bookingData.barberName} vào ngày ${bookingData.date} lúc ${bookingData.time} đã được xác nhận`,
    data: { bookingId: bookingData.bookingId },
  });
};

export const sendBookingCancelledNotification = async (
  bookingData: {
    bookingId: string;
    customerId: string;
    barberId: string;
    barberName: string;
    date: string;
    time: string;
  }
) => {
  await Promise.all([
    createNotification({
      userId: bookingData.customerId,
      type: "BOOKING_CANCELLED",
      title: "Lịch hẹn đã bị hủy",
      message: `Lịch hẹn với barber ${bookingData.barberName} vào ngày ${bookingData.date} lúc ${bookingData.time} đã bị hủy`,
      data: { bookingId: bookingData.bookingId },
    }),
    createNotification({
      userId: bookingData.barberId,
      type: "BOOKING_CANCELLED",
      title: "Lịch hẹn bị hủy",
      message: `Lịch hẹn với khách hàng vào ngày ${bookingData.date} lúc ${bookingData.time} đã bị hủy`,
      data: { bookingId: bookingData.bookingId },
    }),
  ]);
};

export const sendBookingCompletedNotification = async (
  bookingData: {
    bookingId: string;
    customerId: string;
    barberName: string;
    serviceName: string;
  }
) => {
  await createNotification({
    userId: bookingData.customerId,
    type: "BOOKING_COMPLETED",
    title: "Dịch vụ đã hoàn thành",
    message: `Dịch vụ ${bookingData.serviceName} với barber ${bookingData.barberName} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`,
    data: { bookingId: bookingData.bookingId },
  });
};

export const sendPaymentSuccessNotification = async (
  paymentData: {
    paymentId: string;
    customerId: string;
    amount: number;
    bookingId: string;
  }
) => {
  await createNotification({
    userId: paymentData.customerId,
    type: "PAYMENT_SUCCESS",
    title: "Thanh toán thành công",
    message: `Thanh toán ${paymentData.amount.toLocaleString("vi-VN")} VNĐ cho lịch hẹn đã được ghi nhận`,
    data: { paymentId: paymentData.paymentId, bookingId: paymentData.bookingId },
  });
};

export const sendNewUserRegisteredNotification = async (
  userData: {
    userId: string;
    fullName: string;
    role: string;
  }
) => {
  const roleName = {
    BARBER: "Barber",
    RECEPTIONIST: "Lễ tân",
    CLIENT: "Khách hàng",
  }[userData.role] || userData.role;

  await createNotification({
    userId: "admin",
    type: "USER_REGISTERED",
    title: "Đăng ký tài khoản mới",
    message: `${userData.fullName} đã đăng ký tài khoản ${roleName} mới`,
    data: { userId: userData.userId, role: userData.role },
  });
};
