import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "thads_barber_secret_key_2024";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

let io: Server;

interface JoinRoomPayload {
  userId: string;
  role: string;
}

export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Xác thực thất bại: Không có token"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        role: string;
      };
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error("Xác thực thất bại: Token không hợp lệ"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    socket.on("join", (payload: JoinRoomPayload) => {
      const room = `user:${payload.userId}`;
      socket.join(room);
      console.log(`User ${payload.userId} joined room: ${room}`);
    });

    socket.on("leave", (payload: JoinRoomPayload) => {
      const room = `user:${payload.userId}`;
      socket.leave(room);
      console.log(`User ${payload.userId} left room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo");
  }
  return io;
};

export const sendNotificationToUser = (
  userId: string | mongoose.Types.ObjectId,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  const io = getIO();
  const room = `user:${userId.toString()}`;

  io.to(room).emit("notification", {
    ...notification,
    userId: userId.toString(),
    createdAt: new Date().toISOString(),
  });
};

export const sendNotificationToRole = (
  role: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  const io = getIO();
  io.to(`role:${role}`).emit("notification", {
    ...notification,
    createdAt: new Date().toISOString(),
  });
};

export const sendNotificationToAll = (
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  const io = getIO();
  io.emit("notification", {
    ...notification,
    createdAt: new Date().toISOString(),
  });
};

export const joinRoleRoom = (socket: AuthenticatedSocket, role: string) => {
  socket.join(`role:${role}`);
};

export const leaveRoleRoom = (socket: AuthenticatedSocket, role: string) => {
  socket.leave(`role:${role}`);
};
