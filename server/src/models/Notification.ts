import mongoose, { Schema, type Document } from "mongoose";

export type NotificationType =
  | "BOOKING_NEW"
  | "BOOKING_CANCELLED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_COMPLETED"
  | "BOOKING_REMINDER"
  | "APPOINTMENT_STARTING"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "USER_REGISTERED"
  | "ACCOUNT_BLOCKED"
  | "VOUCHER_EXPIRED"
  | "REVIEW_RECEIVED";

export type NotificationStatus = "UNREAD" | "READ";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status: NotificationStatus;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "BOOKING_NEW",
        "BOOKING_CANCELLED",
        "BOOKING_CONFIRMED",
        "BOOKING_COMPLETED",
        "BOOKING_REMINDER",
        "APPOINTMENT_STARTING",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "USER_REGISTERED",
        "ACCOUNT_BLOCKED",
        "VOUCHER_EXPIRED",
        "REVIEW_RECEIVED",
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["UNREAD", "READ"],
      default: "UNREAD",
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
