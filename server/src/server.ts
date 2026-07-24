import "dotenv/config";

import { createServer } from "http";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { markOverdueAppointmentsAsNoShow } from "./services/appointment.service.js";
import { initializeSocket } from "./socket/socket.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const httpServer = createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
      console.log(`Socket.io đã được khởi tạo`);
    });

    const noShowTimer = setInterval(() => {
      void markOverdueAppointmentsAsNoShow().catch((error: unknown) => {
        console.error("Không thể tự động cập nhật lịch vắng mặt:", error);
      });
    }, 60_000);
    noShowTimer.unref();
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
};

void startServer();
