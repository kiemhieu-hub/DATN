import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getBarberDashboard } from "../../services/barberDashboard.service";
import type { BarberDashboardData } from "../../types/BarberDashboard";
import { queryKeys } from "../../lib/queryKeys";
import { BarberLeaveRegistrationModal } from "../../components/BarberLeaveRegistrationModal";
import "./css/Dashboard.css";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const today = () => new Date().toISOString().slice(0, 10);

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth("BARBER");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "BARBER") {
      navigate("/barber/login", { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const dashboardQuery = useQuery({
    queryKey: queryKeys.barberDashboard({ dateFrom, dateTo }),
    queryFn: async () => (await getBarberDashboard({ dateFrom, dateTo })).data,
    enabled: !authLoading && isAuthenticated && user?.role === "BARBER",
  });

  const data: BarberDashboardData | undefined = dashboardQuery.data;
  const error = dashboardQuery.error
    ? axios.isAxiosError(dashboardQuery.error)
      ? dashboardQuery.error.response?.data?.message || "Không thể tải dữ liệu."
      : "Không thể tải dữ liệu."
    : "";

  const maxRevenue = useMemo(
    () => Math.max(1, ...(data?.revenueSeries.map((item) => item.amount) ?? [1])),
    [data]
  );
  const unread = data?.appointments.filter((item) => !item.barberViewedAt).length ?? 0;
  const completed = data?.outcomes.completionRate ?? 0;
  const cancelled = data?.outcomes.cancellationRate ?? 0;
  const donut = `conic-gradient(#258657 0 ${completed}%, #d94c4c ${completed}% ${completed + cancelled}%, #ddd4c7 ${completed + cancelled}% 100%)`;

  if (authLoading || (dashboardQuery.isPending && !data)) {
    return <div className="barber-dashboard-page barber-dashboard-loading">Đang tải Dashboard...</div>;
  }

  return (
    <div className="barber-dashboard-page">
      <main className="barber-dashboard-container">
        <header className="barber-dashboard-header">
          <div>
            <p className="eyebrow">THADS BARBER</p>
            <h1>Dashboard Barber</h1>
            <p>Xin chào {user?.fullName}. Theo dõi doanh thu và lịch làm việc của bạn.</p>
          </div>
          <nav>
            <Link className="bell" to="/barber/schedule" aria-label="Thông báo">♢{unread > 0 && <b>{unread}</b>}</Link>
            <Link to="/barber/schedule">Lịch hẹn</Link>
            <Link to="/barber/working-schedule">Lịch làm việc</Link>
            <button type="button" onClick={() => setIsLeaveModalOpen(true)}>
              Đăng ký nghỉ
            </button>
            <Link to="/barber/profile">Cá nhân</Link>
            <button onClick={() => { logout(); navigate("/barber/login"); }}>Đăng xuất</button>
          </nav>
        </header>

        <section className="barber-dashboard-filter">
          <label>Từ ngày<input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label>Đến ngày<input type="date" min={dateFrom} value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          <button onClick={() => void dashboardQuery.refetch()}>Làm mới</button>
        </section>
        {error && <p className="barber-dashboard-error">{error}</p>}

        {data && <>
          <section className="barber-dashboard-charts">
            <article className="revenue-chart">
              <div className="chart-title"><div><small>DOANH THU</small><h2>{money(data.revenue)}đ</h2></div></div>
              <div className="bar-chart">
                {data.revenueSeries.map((item) => (
                  <div className="bar-column" key={item.date} title={`${item.date}: ${money(item.amount)}đ`}>
                    <span>{item.amount ? money(item.amount) : "0"}</span>
                    <i style={{ height: `${Math.max(4, (item.amount / maxRevenue) * 100)}%` }} />
                    <small>{item.date.slice(5).split("-").reverse().join("/")}</small>
                  </div>
                ))}
              </div>
            </article>
            <article className="outcome-chart">
              <small>TỶ LỆ LỊCH HẸN</small>
              <div className="donut" style={{ background: donut }}><strong>{data.appointments.length}</strong><span>lịch hẹn</span></div>
              <div className="legend"><span><i className="green" />Hoàn thành {completed}%</span><span><i className="red" />Hủy {cancelled}%</span></div>
            </article>
          </section>

          <section className="dashboard-appointments">
            <div className="section-heading"><div><small>LỊCH LÀM VIỆC</small><h2>Lịch hẹn trong khoảng đã chọn</h2></div><Link to="/barber/schedule">Xem tất cả →</Link></div>
            {data.appointments.length === 0 ? <p className="empty">Không có lịch hẹn.</p> : data.appointments.map((item) => (
              <article key={item._id} className={!item.barberViewedAt ? "unread" : ""}>
                <div><b>{item.client?.fullName || "Khách hàng"}</b><small>{item.client?.phone}</small></div>
                <div><b>{item.appointmentDate}</b><small>{item.startTime}–{item.endTime}</small></div>
                <div><b>{item.services.map((service) => service.name).join(", ")}</b></div>
                {!item.barberViewedAt && <em>Mới</em>}
              </article>
            ))}
          </section>
        </>}
        <BarberLeaveRegistrationModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          currentUser={user || undefined}
          isReceptionist={false}
          onSuccess={() => void dashboardQuery.refetch()}
        />
      </main>
    </div>
  );
}

export default Dashboard;