import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  return io;
};

export const emitAppointmentsChanged = (): void => {
  io?.emit("appointments:changed");
};

export const emitNotificationsChanged = (): void => {
  io?.emit("notifications:changed");
};

export const emitBusinessChanged = (): void => {
  io?.emit("business:changed");
};

export const emitStaffDataChanged = (): void => {
  emitBusinessChanged();
  emitAppointmentsChanged();
  emitNotificationsChanged();
};
