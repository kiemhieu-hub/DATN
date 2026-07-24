import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { notificationService, type Notification } from "../services/notificationService";
import socketService, { type NotificationPayload } from "../services/socketService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(1, 20);
      setNotifications(response.notifications);
      setPage(1);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoreNotifications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await notificationService.getNotifications(nextPage, 20);
      setNotifications((prev) => [...prev, ...response.notifications]);
      setPage(nextPage);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error("Lỗi khi tải thêm thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy số thông báo chưa đọc:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "READ" as const } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "READ" as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deleted = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (deleted?.status === "UNREAD") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  }, [notifications]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (token && userId && role) {
      socketService.connect(token);
      socketService.joinRoom(userId, role);

      socketService.onNotification((notification: NotificationPayload) => {
        setNotifications((prev) => [
          {
            _id: notification._id || Date.now().toString(),
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            status: "UNREAD",
            createdAt: notification.createdAt || new Date().toISOString(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      void fetchNotifications();
      void refreshUnreadCount();

      return () => {
        socketService.leaveRoom(userId, role);
        socketService.disconnect();
      };
    }
  }, [fetchNotifications, refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        fetchNotifications,
        fetchMoreNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export default NotificationContext;
