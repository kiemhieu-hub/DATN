import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { getAdminDashboard } from "../../services/adminDashboard.service";
import {
  getStaffNotifications,
  markAllStaffNotificationsRead,
  markStaffNotificationRead,
} from "../../services/staffNotification.service";

import type {
  AdminDashboardAppointment,
  AdminDashboardData,
} from "../../types/AdminDashboard";
import type { StaffNotification } from "../../types/StaffNotification";

import "./css/Dashboard.css";

const statusLabels: Record<AdminDashboardAppointment["status"], string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message
      || "Không thể tải dữ liệu Dashboard.";
  }
  return "Không thể tải dữ liệu Dashboard.";
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth("ADMIN");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminDashboard();
      setData(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await getStaffNotifications();
      setNotifications(response.items);
      setUnreadCount(response.unreadCount);
    } catch {
      // Thông báo không làm gián đoạn dữ liệu chính của Dashboard.
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    const closeWhenClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current
        && !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", closeWhenClickOutside);
    return () => document.removeEventListener("mousedown", closeWhenClickOutside);
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
        // Vẫn cho phép Admin mở lịch hẹn khi API đánh dấu đã đọc bị lỗi.
      }
    }

    setIsNotificationOpen(false);

    const appointmentId =
      typeof notification.appointment === "string"
        ? notification.appointment
        : notification.appointment?._id;

    navigate(
      appointmentId
        ? `/admin/appointments?appointmentId=${encodeURIComponent(appointmentId)}`
        : "/admin/appointments"
    );
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    try {
      await markAllStaffNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch {
      setError("Không thể đánh dấu tất cả thông báo đã đọc.");
    }
  };

  const formatNotificationTime = (value: string): string =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const activeAppointments = useMemo(() => {
    if (!data) return 0;
    return data.statistics.pendingAppointments
      + data.statistics.confirmedAppointments
      + data.statistics.inProgressAppointments;
  }, [data]);

  if (loading) {
    return <div className="admin-dashboard-page admin-dashboard-loading">Đang tải Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-page">
      <main className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <span>THADS ADMIN CENTER</span>
            <h1>Dashboard</h1>
            <p>Xin chào {user?.fullName}. Đây là tổng quan vận hành hệ thống hôm nay.</p>
          </div>

          <div className="admin-dashboard-header-actions">
            <button
              type="button"
              className="admin-dashboard-refresh"
              onClick={() => void loadDashboard()}
            >
              Làm mới dữ liệu
            </button>

            <div className="admin-dashboard-notification" ref={notificationRef}>
              <button
                type="button"
                className="admin-notification-bell"
                aria-label="Mở thông báo"
                aria-expanded={isNotificationOpen}
                onClick={() => setIsNotificationOpen((current) => !current)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                  <span className="admin-notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <section className="admin-notification-panel">
                  <div className="admin-notification-panel-header">
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
                  </div>

                  <div className="admin-notification-list">
                    {notifications.length === 0 ? (
                      <p className="admin-notification-empty">
                        Chưa có thông báo.
                      </p>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          title={notification.message}
                          className={
                            notification.isRead
                              ? "admin-notification-item"
                              : "admin-notification-item unread"
                          }
                          onClick={() => void openNotification(notification)}
                        >
                          <span className="admin-notification-item-title">
                            {notification.title}
                          </span>
                          <span className="admin-notification-item-message">
                            {notification.message}
                          </span>
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
          </div>
        </header>

        {error && <div className="admin-dashboard-error">{error}</div>}

        {data && (
          <>
            <section className="admin-dashboard-overview">
              <article>
                <span>Tổng người dùng</span>
                <strong>{data.statistics.totalUsers}</strong>
                <small>{data.statistics.totalClients} khách hàng</small>
              </article>

              <article>
                <span>Barber</span>
                <strong>{data.statistics.totalBarbers}</strong>
                <small>Tài khoản thợ trong hệ thống</small>
              </article>

              <article>
                <span>Dịch vụ</span>
                <strong>{data.statistics.totalServices}</strong>
                <small>Dịch vụ đang hoạt động</small>
              </article>

              <article>
                <span>Lịch hôm nay</span>
                <strong>{data.statistics.todayAppointments}</strong>
                <small>{activeAppointments} lịch đang xử lý</small>
              </article>
            </section>

            <section className="admin-dashboard-status-grid">
              <article><span>Chờ xác nhận</span><b>{data.statistics.pendingAppointments}</b></article>
              <article><span>Đã xác nhận</span><b>{data.statistics.confirmedAppointments}</b></article>
              <article><span>Đang thực hiện</span><b>{data.statistics.inProgressAppointments}</b></article>
              <article><span>Hoàn thành</span><b>{data.statistics.completedAppointments}</b></article>
              <article><span>Đã hủy</span><b>{data.statistics.cancelledAppointments}</b></article>
            </section>

            <section className="admin-dashboard-content-grid">
              <article className="admin-dashboard-recent">
                <div className="admin-dashboard-section-title">
                  <div><span>HOẠT ĐỘNG GẦN ĐÂY</span><h2>Lịch hẹn mới nhất</h2></div>
                  <Link to="/admin/appointments">Xem tất cả</Link>
                </div>

                <div className="admin-dashboard-table-wrap">
                  <table>
                    <thead><tr><th>Khách hàng</th><th>Ngày hẹn</th><th>Khung giờ</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {data.recentAppointments.slice(0, 6).map((appointment) => (
                        <tr key={appointment._id}>
                          <td>{typeof appointment.client === "string" ? "Không xác định" : appointment.client.fullName}</td>
                          <td>{formatDate(appointment.appointmentDate)}</td>
                          <td>{appointment.startTime}–{appointment.endTime}</td>
                          <td><span className={`dashboard-status ${appointment.status.toLowerCase()}`}>{statusLabels[appointment.status]}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <aside className="admin-dashboard-shortcuts">
                <span>TRUY CẬP NHANH</span>
                <h2>Quản lý hệ thống</h2>
                <Link to="/admin/revenue">Xem báo cáo doanh thu <b>→</b></Link>
                <Link to="/admin/appointments">Quản lý lịch hẹn <b>→</b></Link>
                <Link to="/admin/barbers">Quản lý Barber <b>→</b></Link>
                <Link to="/admin/users">Quản lý người dùng <b>→</b></Link>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
