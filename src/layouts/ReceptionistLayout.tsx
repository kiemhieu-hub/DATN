import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import {
  getStaffNotifications,
  markAllStaffNotificationsRead,
  markStaffNotificationRead,
} from "../services/staffNotification.service";
import type { StaffNotification } from "../types/StaffNotification";
import "./AdminLayout.css";

const formatNotificationTime = (value: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function ReceptionistLayout() {
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, logout } =
    useAuth("RECEPTIONIST");

  const [collapsed, setCollapsed] = useState(
    () =>
      localStorage.getItem("receptionistSidebarCollapsed") === "true"
  );
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || !user || user.role !== "RECEPTIONIST")
    ) {
      navigate("/receptionist/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const loadNotifications = useCallback(async (): Promise<void> => {
    try {
      const response = await getStaffNotifications();
      setNotifications(response.items);
      setUnreadCount(response.unreadCount);
      setNotificationError("");
    } catch {
      setNotificationError("Không thể tải thông báo. Vui lòng thử lại.");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "RECEPTIONIST") return;

    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [isAuthenticated, loadNotifications, user?.role]);

  useEffect(() => {
    const closeWhenClickOutside = (event: MouseEvent): void => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", closeWhenClickOutside);
    return () =>
      document.removeEventListener("mousedown", closeWhenClickOutside);
  }, []);

  const openNotification = async (
    notification: StaffNotification
  ): Promise<void> => {
    if (!notification.isRead) {
      try {
        await markStaffNotificationRead(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Vẫn mở lịch hẹn nếu thao tác đánh dấu đã đọc bị lỗi.
      }
    }

    const appointmentId =
      typeof notification.appointment === "string"
        ? notification.appointment
        : notification.appointment?._id;

    setIsNotificationOpen(false);
    navigate(
      appointmentId
        ? `/receptionist/dashboard?appointmentId=${encodeURIComponent(
            appointmentId
          )}`
        : "/receptionist/dashboard"
    );
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    try {
      await markAllStaffNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
      setNotificationError("");
    } catch {
      setNotificationError("Không thể đánh dấu tất cả thông báo đã đọc.");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-shell-loading">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "RECEPTIONIST") {
    return null;
  }

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="admin-shell-sidebar">
        <NavLink to="/receptionist/dashboard" className="admin-shell-brand">
          <div className="admin-shell-logo">T</div>
          <div className="admin-shell-brand-text">
            <h2>THADS</h2>
            <span>RECEPTION CENTER</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="admin-sidebar-toggle"
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          onClick={() =>
            setCollapsed((current) => {
              localStorage.setItem(
                "receptionistSidebarCollapsed",
                String(!current)
              );
              return !current;
            })
          }
        >
          {collapsed ? "›" : "‹"}
        </button>

        <nav className="admin-shell-navigation">
          <NavLink
            to="/receptionist/dashboard"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="admin-nav-icon">LH</span>
            <span className="admin-nav-label">Quản lý lịch hẹn</span>
          </NavLink>

          <NavLink
            to="/receptionist/barbers"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="admin-nav-icon">BB</span>
            <span className="admin-nav-label">Lịch làm việc Barber</span>
          </NavLink>
        </nav>

        <div className="admin-shell-user">
          <span className="admin-user-label">Tài khoản lễ tân</span>
          <b className="admin-user-name">{user.fullName}</b>
          <small className="admin-user-email">{user.email}</small>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/receptionist/login");
            }}
          >
            <span className="admin-logout-full">Đăng xuất</span>
            <span className="admin-logout-short">↪</span>
          </button>
        </div>
      </aside>

      <main className="admin-shell-content">
        <div
          ref={notificationRef}
          className="reception-notification-center"
          onMouseEnter={() => setIsNotificationOpen(true)}
        >
          <button
            type="button"
            className="reception-notification-bell"
            aria-label="Mở thông báo lễ tân"
            aria-expanded={isNotificationOpen}
            onClick={() =>
              setIsNotificationOpen((current) => !current)
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="reception-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <section className="reception-notification-panel">
              <header>
                <div>
                  <span>THÔNG BÁO</span>
                  <h2>Công việc cần xử lý</h2>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllNotificationsRead()}
                  >
                    Đọc tất cả
                  </button>
                )}
              </header>

              {notificationError && (
                <p className="reception-notification-error">
                  {notificationError}
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                  >
                    Thử lại
                  </button>
                </p>
              )}

              <div className="reception-notification-list">
                {notifications.length === 0 && !notificationError ? (
                  <p className="reception-notification-empty">
                    Chưa có thông báo.
                  </p>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <button
                      type="button"
                      key={notification._id}
                      className={`reception-notification-item ${
                        notification.isRead ? "" : "unread"
                      }`}
                      title={notification.message}
                      onClick={() => void openNotification(notification)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <time>
                        {formatNotificationTime(notification.createdAt)}
                      </time>
                    </button>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default ReceptionistLayout;
