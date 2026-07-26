import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { markOverdueAppointmentsAsNoShow } from "./services/appointment.service.js";
import { createUpcomingNotifications } from "./services/staffNotification.service.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });

    const noShowTimer = setInterval(() => {
      void markOverdueAppointmentsAsNoShow().catch((error: unknown) => {
        console.error("Không thể tự động cập nhật lịch vắng mặt:", error);
      });
      void createUpcomingNotifications().catch((error: unknown) => {
        console.error("Không thể tạo thông báo lịch sắp tới:", error);
      });
    }, 60_000);
    noShowTimer.unref();
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
};

void startServer();
