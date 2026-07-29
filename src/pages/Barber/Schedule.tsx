import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getBarberAppointments } from "../../services/barbarAppointment.service";
import type { Appointment, AppointmentStatus } from "../../types/Appoinment";
import "./css/Schedule.css";

const labels: Record<AppointmentStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const statusClasses: Record<AppointmentStatus, string> = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  CHECKED_IN: "status-checkedin",
  IN_PROGRESS: "status-inprogress",
  COMPLETED: "status-completed",
  NO_SHOW: "status-noshow",
  CANCELLED: "status-cancelled",
};

const money = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

function Schedule() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth("BARBER");
  const [items, setItems] = useState<Appointment[]>([]);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBarberAppointments({
        appointmentDate: date || undefined,
      });
      setItems(response.appointments);
    } catch (e) {
      setError(
        axios.isAxiosError(e)
          ? e.response?.data?.message || "Không thể tải lịch"
          : "Không thể tải lịch"
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/barber/login", { replace: true });
      return;
    }
    void load();
  }, [isLoading, isAuthenticated, user, navigate, load]);

  // Tính toán nhanh số liệu thống kê
  const totalAppointments = items.length;
  const completedCount = items.filter((i) => i.status === "COMPLETED").length;
  const totalValue = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);

  if (isLoading || loading)
    return <div className="barber-view-loading">Đang tải lịch làm việc...</div>;

  return (
    <div className="barber-view-page">
      <div className="barber-schedule-container">
        {/* Header Chuyên Nghiệp */}
        <header className="barber-header">
          <div className="header-brand-info">
            <span className="brand-tag">THADS BARBER • WORKSPACE</span>
            <h1 className="header-title">LỊCH HẸN ĐƯỢC PHÂN CÔNG</h1>
            <p className="header-desc">
              Quản lý và theo dõi lịch cắt tóc của khách hàng theo thời gian thực.
            </p>
          </div>
          <nav className="header-nav-tabs">
            <Link to="/barber/dashboard" className="nav-tab">
              Tổng quan
            </Link>
            <Link to="/barber/schedule" className="nav-tab active">
              Lịch hẹn
            </Link>
            <Link to="/barber/working-schedule" className="nav-tab">
              Ca làm việc
            </Link>
            <Link to="/barber/profile" className="nav-tab">
              Cá nhân
            </Link>
          </nav>
        </header>

        {error && <div className="barber-view-error">{error}</div>}

        {/* Khối Card Thống Kê Nhanh (Stat Cards) */}
        <div className="barber-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Tổng ca phân công</span>
            <span className="stat-value">{totalAppointments}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Đã hoàn thành</span>
            <span className="stat-value highlight-green">{completedCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tổng giá trị dự kiến</span>
            <span className="stat-value highlight-gold">{money(totalValue)}đ</span>
          </div>
        </div>

        {/* Thanh Lọc Chuyên Nghiệp */}
        <div className="barber-filter-bar">
          <div className="filter-group">
            <label htmlFor="filter-date">Lọc theo ngày:</label>
            <input
              id="filter-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="filter-date-input"
            />
          </div>
          {date && (
            <button className="clear-filter-btn" onClick={() => setDate("")}>
              ✕ Xóa bộ lọc (Xem tất cả)
            </button>
          )}
        </div>

        {/* Bảng Dữ Liệu Rộng Rãi, Sang Trọng */}
        <div className="barber-view-table-wrapper">
          <table className="barber-schedule-table">
            <thead>
              <tr>
                <th>MÃ LỊCH</th>
                <th>KHÁCH HÀNG</th>
                <th>NGÀY & GIỜ</th>
                <th>DỊCH VỤ ĐẶT</th>
                <th>GIÁ TRỊ</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table-cell">
                    Hiện chưa có lịch hẹn nào được phân công trong ngày này.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="code-cell">
                      #{item.appointmentCode || item._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="customer-cell">
                      <div className="customer-name">
                        {item.customer?.fullName || "Khách vãng lai"}
                      </div>
                      <div className="customer-phone">
                        {item.customer?.phone || "—"}
                      </div>
                    </td>
                    <td className="time-cell">
                      <div className="time-date">{item.appointmentDate}</div>
                      <div className="time-range">
                        {item.startTime} – {item.endTime}
                      </div>
                    </td>
                    <td className="services-cell">
                      {item.services.map((s) => s.nameSnapshot).join(", ")}
                    </td>
                    <td className="price-cell">{money(item.totalPrice)}đ</td>
                    <td className="status-cell">
                      <span
                        className={`status-badge ${
                          statusClasses[item.status]
                        }`}
                      >
                        {labels[item.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Schedule;