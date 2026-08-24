import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { realtimeSocket } from "../../lib/realtime";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../contexts/AuthContext";
import { getAdminDashboard } from "../../services/adminDashboard.service";
import { getCatalogBarbers } from "../../services/catalog.service";
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
import type { CatalogBarber } from "../../types/Catalog";

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

  // Filters for dashboard
  const [period, setPeriod] = useState<"DAY" | "MONTH" | "YEAR">("MONTH");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [barberId, setBarberId] = useState("");

  const filters = useMemo(() => ({
    period,
    date,
    barberId: barberId || undefined,
  }), [period, date, barberId]);

  // Fetch barbers for filter dropdown
  const barbersQuery = useQuery({
    queryKey: [...["catalog", "barbers"], filters],
    queryFn: async () => (await getCatalogBarbers()).barbers,
  });
  const barbers: CatalogBarber[] = barbersQuery.data ?? [];

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchBusinessQuery("admin-dashboard", () => getAdminDashboard(filters));
      setData(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetchBusinessQuery("staff-notifications", () => getStaffNotifications());
      setNotifications(response.items);
      setUnreadCount(response.unreadCount);
    } catch {
      // Thông báo không làm gián đoạn dữ liệu chính của Dashboard.
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const handleStaffDataChanged = (): void => {
      void loadDashboard();
      void loadNotifications();
    };

    realtimeSocket.on("notifications:changed", handleStaffDataChanged);
    realtimeSocket.on("appointments:changed", handleStaffDataChanged);

    return () => {
      realtimeSocket.off("notifications:changed", handleStaffDataChanged);
      realtimeSocket.off("appointments:changed", handleStaffDataChanged);
    };
  }, [loadDashboard, loadNotifications]);

  useRealtimeRefresh(() => {
    void loadDashboard();
    void loadNotifications();
  });

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
            {/* Filter Section */}
            <section className="admin-dashboard-filters">
              <label>
                Chu kỳ
                <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
                  <option value="DAY">Theo ngày</option>
                  <option value="MONTH">Theo tháng</option>
                  <option value="YEAR">Theo năm</option>
                </select>
              </label>

              <label>
                Ngày đối chiếu
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>

              <label>
                Barber
                <select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                  <option value="">Tất cả Barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>{barber.fullName}</option>
                  ))}
                </select>
              </label>
            </section>

            {/* Stats Overview */}
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

            {/* Status Grid + Pie Chart */}
            <section className="admin-dashboard-status-section">
              <div className="admin-dashboard-status-grid">
                <article><span>Chờ xác nhận</span><b>{data.statistics.pendingAppointments}</b></article>
                <article><span>Đã xác nhận</span><b>{data.statistics.confirmedAppointments}</b></article>
                <article><span>Đang thực hiện</span><b>{data.statistics.inProgressAppointments}</b></article>
                <article><span>Hoàn thành</span><b className="text-success">{data.statistics.completedAppointments}</b></article>
                <article><span>Đã hủy</span><b className="text-danger">{data.statistics.cancelledAppointments}</b></article>
              </div>

              {/* Pie Chart - Appointment Status */}
              <div className="admin-dashboard-pie-chart">
                <h3>Tỉ lệ lịch hẹn</h3>
                <div className="admin-pie-chart-container">
                  {(() => {
                    const total = data.statistics.totalAppointments || 1;
                    const completed = Math.round((data.statistics.completedAppointments / total) * 100);
                    const cancelled = Math.round((data.statistics.cancelledAppointments / total) * 100);
                    const pending = 100 - completed - cancelled;
                    return (
                      <svg viewBox="0 0 100 100" className="admin-pie-svg">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="20"
                          strokeDasharray={`${completed * 2.51} ${251.2 - completed * 2.51}`} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="20"
                          strokeDasharray={`${cancelled * 2.51} ${251.2 - cancelled * 2.51}`}
                          strokeDashoffset={`-${completed * 2.51}`} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="20"
                          strokeDasharray={`${pending * 2.51} ${251.2 - pending * 2.51}`}
                          strokeDashoffset={`-${(completed + cancelled) * 2.51}`} />
                        <text x="50" y="45" textAnchor="middle" fill="#f2f0eb" fontSize="12" fontWeight="bold">
                          {total}
                        </text>
                        <text x="50" y="58" textAnchor="middle" fill="#8d8a83" fontSize="6">Tổng lịch</text>
                      </svg>
                    );
                  })()}
                </div>
                <div className="admin-pie-legend">
                  <span className="legend-item"><i className="dot dot-success"></i> Hoàn thành: {Math.round((data.statistics.completedAppointments / (data.statistics.totalAppointments || 1)) * 100)}%</span>
                  <span className="legend-item"><i className="dot dot-danger"></i> Hủy: {Math.round((data.statistics.cancelledAppointments / (data.statistics.totalAppointments || 1)) * 100)}%</span>
                  <span className="legend-item"><i className="dot dot-warning"></i> Khác: {Math.round(((data.statistics.totalAppointments - data.statistics.completedAppointments - data.statistics.cancelledAppointments) / (data.statistics.totalAppointments || 1)) * 100)}%</span>
                </div>
              </div>
            </section>

            {/* Bar Chart - Revenue Last 7 Days */}
            <section className="admin-dashboard-chart-section">
              <div className="admin-dashboard-bar-chart-card">
                <h3>Doanh thu 7 ngày gần nhất</h3>
                <div className="admin-bar-chart">
                  {data.revenueLastSevenDays.length > 0 ? (
                    (() => {
                      const maxRevenue = Math.max(...data.revenueLastSevenDays.map(p => p.revenue), 1);
                      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                      return data.revenueLastSevenDays.map((point, idx) => {
                        const dayIndex = new Date(point.date).getDay();
                        const height = Math.round((point.revenue / maxRevenue) * 100);
                        return (
                          <div key={point.date} className="admin-bar-item">
                            <div className="admin-bar-tooltip">
                              <strong>{new Intl.NumberFormat("vi-VN").format(point.revenue)}đ</strong>
                              <small>{point.completedAppointments} lịch</small>
                            </div>
                            <div className="admin-bar" style={{ height: `${height}%` }}>
                              <div className="admin-bar-fill"></div>
                            </div>
                            <span className="admin-bar-label">{days[dayIndex]}</span>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <p className="admin-dashboard-empty-chart">Chưa có dữ liệu doanh thu</p>
                  )}
                </div>
              </div>
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
