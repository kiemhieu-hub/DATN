import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getMyBarberSchedule } from "../../services/barberSchedule.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";
import "./css/WorkingSchedule.css";
import "./css/Schedule.css";

const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function WorkingSchedule() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth("BARBER");
  const [items, setItems] = useState<BarberScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetchBusinessQuery(
        "barber-working-schedule",
        () => getMyBarberSchedule(),
        undefined,
        0
      );
      setItems(response.schedules);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/barber/login", { replace: true });
      return;
    }
    void load();
  }, [isLoading, isAuthenticated, user, navigate, load]);

  useRealtimeRefresh(() => {
    void load();
  }, isAuthenticated);

  if (isLoading || loading) {
    return <div className="barber-view-page" style={{ padding: '40px', textAlign: 'center' }}>Đang tải ca làm việc...</div>;
  }

  return (
    <div className="barber-view-page">
      <main className="barber-schedule-container">
        {/* Header Bar */}
        <header className="barber-header-card">
          <div>
            <span className="barber-brand-tag">THADS BARBER</span>
            <h1 className="barber-page-title">Ca làm việc của tôi</h1>
            <p className="barber-page-desc">Lịch chỉ đọc. Lễ tân và Admin chịu trách nhiệm điều phối.</p>
          </div>
          <nav className="barber-nav-actions">
            <Link to="/barber/dashboard" className="barber-nav-btn">Dashboard</Link>
            <Link to="/barber/schedule" className="barber-nav-btn">Lịch hẹn</Link>
            <Link to="/barber/profile" className="barber-nav-btn">Cá nhân</Link>
          </nav>
        </header>

        {/* Schedule Grid Content */}
        <section className="barber-content-card">
          <div className="barber-week-grid-modern">
            {items
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((item) => (
                <article
                  key={item.dayOfWeek}
                  className={`barber-day-card ${!item.isWorking ? "is-off" : "is-working"}`}
                >
                  <div className="day-badge-header">
                    <span className="day-name">{days[item.dayOfWeek]}</span>
                    <span className={`status-pill ${item.isWorking ? "working" : "off"}`}>
                      {item.isWorking ? "Đi làm" : "Nghỉ"}
                    </span>
                  </div>

                  <div className="day-time-body">
                    {item.isWorking ? (
                      <>
                        <div className="working-hours">{item.startTime} – {item.endTime}</div>
                        <span className="break-note">Làm việc xuyên trưa</span>
                      </>
                    ) : (
                      <div className="day-off-text">Không có ca trực</div>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WorkingSchedule;