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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use("/api/catalog",catalogRoutes);
app.use("/api/barber", barberRoutes);
app.use("/api/barber/schedule",barberScheduleRoutes);
app.use("/api/barber/dashboard",barberDashboardRoutes);
app.use("/api/barber/profile",barberProfileRoutes);
app.use("/api/admin/dashboard",adminDashboardRoutes);
app.use("/api/admin/barbers",adminBarberRoutes);

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