import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    this.socket.on("notification", (data: unknown) => {
      this.notifyListeners("notification", data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userId: string, role: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join", { userId, role });
    }
  }

  leaveRoom(userId: string, role: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave", { userId, role });
    }
  }

  onNotification(callback: (notification: NotificationPayload) => void): () => void {
    return this.addListener("notification", callback);
  }

  private addListener(event: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      callback(data);
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export interface NotificationPayload {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export const socketService = new SocketService();
export default socketService;
