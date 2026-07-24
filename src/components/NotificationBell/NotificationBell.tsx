import { useState, useRef, useEffect } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import "./NotificationBell.css";

interface NotificationBellProps {
  className?: string;
}

const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    BOOKING_NEW: "📅",
    BOOKING_CANCELLED: "❌",
    BOOKING_CONFIRMED: "✓",
    BOOKING_COMPLETED: "✨",
    BOOKING_REMINDER: "⏰",
    APPOINTMENT_STARTING: "🔔",
    PAYMENT_SUCCESS: "💳",
    PAYMENT_FAILED: "⚠️",
    USER_REGISTERED: "👤",
    ACCOUNT_BLOCKED: "🔒",
    VOUCHER_EXPIRED: "🎟️",
    REVIEW_RECEIVED: "⭐",
  };
  return icons[type] || "📬";
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchMoreNotifications,
    hasMore,
    isLoading,
    fetchNotifications,
  } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notificationId: string, isUnread: boolean) => {
    if (isUnread) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;

    if (isAtBottom && hasMore && !isLoading) {
      void fetchMoreNotifications();
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      void fetchNotifications();
    }
  };

  return (
    <div className={`notification-bell-container ${className || ""}`} ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label="Thông báo"
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell-dropdown">
          <div className="notification-bell-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-bell-mark-all"
                onClick={handleMarkAllRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="notification-bell-list" onScroll={handleScroll}>
            {notifications.length === 0 ? (
              <div className="notification-bell-empty">
                <span className="notification-bell-empty-icon">📭</span>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-bell-item ${notification.status === "UNREAD" ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification._id, notification.status === "UNREAD")}
                >
                  <div className="notification-bell-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-bell-item-content">
                    <div className="notification-bell-item-header">
                      <span className="notification-bell-item-title">{notification.title}</span>
                      <button
                        type="button"
                        className="notification-bell-item-delete"
                        onClick={(e) => void handleDelete(e, notification._id)}
                        aria-label="Xóa thông báo"
                      >
                        ×
                      </button>
                    </div>
                    <p className="notification-bell-item-message">{notification.message}</p>
                    <span className="notification-bell-item-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  {notification.status === "UNREAD" && (
                    <div className="notification-bell-item-dot" />
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="notification-bell-loading">
                <span>Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
