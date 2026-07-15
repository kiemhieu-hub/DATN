import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import authRoutes from "./routes/auth.routes";
import AppError from "./utils/AppError";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "THADS Barber API đang hoạt động",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
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