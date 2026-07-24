import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { getAdminDashboard } from "../../services/adminDashboard.service";

import type {
  AdminDashboardAppointment,
  AdminDashboardData,
} from "../../types/AdminDashboard";

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
  const { user } = useAuth("ADMIN");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

          <button type="button" onClick={() => void loadDashboard()}>
            Làm mới dữ liệu
          </button>
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
