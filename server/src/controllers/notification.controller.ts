import { type Request, type Response } from "express";
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notification.service";

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as "UNREAD" | "READ" | undefined;

    const result = await getNotificationsByUser(userId, { page, limit, status });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const getUnreadNotificationsCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }

    const count = await getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Lỗi khi đếm thông báo chưa đọc:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const readNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }

    const notification = await markAsRead(notificationId);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
      return;
    }

    res.json({
      success: true,
      message: "Đã đánh dấu đã đọc",
      notification,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const readAllNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }

    const count = await markAllAsRead(userId);

    res.json({
      success: true,
      message: `Đã đánh dấu ${count} thông báo là đã đọc`,
      count,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const removeNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }

    const deleted = await deleteNotification(notificationId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
      return;
    }

    res.json({
      success: true,
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};
