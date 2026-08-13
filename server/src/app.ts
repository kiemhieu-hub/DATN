import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import AppError from "./utils/AppError";
import catalogRoutes from "./routes/catalog.routes";
import mongoose from "mongoose";
import barberRoutes from "./routes/barber.routes";
import barberScheduleRoutes from "./routes/barberSchedule.routes";
import barberDashboardRoutes from "./routes/barberDashboard.routes";
import barberProfileRoutes from "./routes/barberProfile.routes";
import adminDashboardRoutes from "./routes/adminDashboard.routes";
import adminBarberRoutes from "./routes/adminBarber.routes";
import adminServiceRoutes from "./routes/adminService.routes";
import adminAppointmentRoutes from "./routes/adminAppointment.routes";
import paymentRoutes from "./routes/payment.routes";
import adminUserRoutes from "./routes/adminUser.routes";
import receptionistRoutes from "./routes/receptionist.routes";
import adminContentRoutes from "./routes/adminContent.routes";
import adminVoucherRoutes from "./routes/adminVoucher.routes";
import voucherRoutes from "./routes/voucher.routes";
import adminServiceCategoryRoutes from "./routes/adminServiceCategory.routes";
import adminHairstyleGalleryRoutes from "./routes/adminHairstyleGallery.routes";
import adminReviewRoutes from "./routes/adminReview.routes";
import hairstyleGalleryRoutes from "./routes/hairstyleGallery.routes";
import reviewRoutes from "./routes/review.routes";
import staffNotificationRoutes from "./routes/staffNotification.routes";
import vnpayRoutes from "./routes/vnpay.routes";
import favoriteHairstyleRoutes from "./routes/favoriteHairstyle.routes";
import refundRoutes from "./routes/refund.routes";
import contactRoutes from './routes/contact.routes';
import {
  emitBusinessChanged,
  emitStaffDataChanged,
} from "./realtime/socket";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Phát tín hiệu realtime sau khi API thay đổi lịch hẹn hoặc thông báo.
// Frontend nhận tín hiệu rồi tải lại dữ liệu bằng API có xác thực.
app.use((req, res, next) => {
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);

  if (isMutation) {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const isStaffOperation =
          req.path.includes("/appointments") ||
          req.path.includes("/notifications") ||
          req.path.includes("/payments") ||
          req.path.includes("/refunds");

        if (isStaffOperation) {
          emitStaffDataChanged();
        } else {
          emitBusinessChanged();
        }
      }
    });
  }

  next();
});

// Test API
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "THADS Barber API đang hoạt động",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/hairstyle-gallery", hairstyleGalleryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/catalog",catalogRoutes);
app.use("/api/barber", barberRoutes);
app.use("/api/barber/schedule",barberScheduleRoutes);
app.use("/api/barber/dashboard",barberDashboardRoutes);
app.use("/api/barber/profile",barberProfileRoutes);
app.use("/api/admin/dashboard",adminDashboardRoutes);
app.use("/api/admin/barbers",adminBarberRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/appointments", adminAppointmentRoutes);
app.use("/api/admin/payments", paymentRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/vouchers", adminVoucherRoutes);
app.use("/api/admin/service-categories", adminServiceCategoryRoutes);
app.use("/api/admin/hairstyle-gallery", adminHairstyleGalleryRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin", adminContentRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/staff/notifications", staffNotificationRoutes);
app.use("/api/payments/vnpay", vnpayRoutes);
app.use("/api/favorites", favoriteHairstyleRoutes);
app.use("/api/admin/refunds", refundRoutes);
app.use('/api/contacts', contactRoutes);


// Error Handler
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const firstError =
        Object.values(error.errors)[0];

      res.status(400).json({
        success: false,
        message:
          firstError?.message ||
          "Dữ liệu không hợp lệ",
      });
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message:
          "Email hoặc số điện thoại đã tồn tại",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
);

export default app;
