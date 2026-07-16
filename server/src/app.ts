import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import AppError from "./utils/AppError";

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

// Error Handler
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
);

export default app;