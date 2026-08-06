import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getMyBarberSchedule } from "../../services/baberSchedule.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";
import "./css/WorkingSchedule.css";

const days = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

function WorkingSchedule() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth("BARBER");
  const [items, setItems] = useState<BarberScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await getMyBarberSchedule();
      setItems(r.schedules);
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

  if (isLoading || loading)
    return <div className="barber-view-loading">Đang tải lịch làm việc...</div>;

  // Tính toán nhanh tổng số ngày làm việc trong tuần
  const workingDaysCount = items.filter((item) => item.isWorking).length;

  return (
    <div className="barber-view-page">
      <div className="barber-schedule-container">
        {/* Header Chuyên Nghiệp Đồng Bộ */}
        <header className="barber-header">
          <div className="header-brand-info">
            <span className="brand-tag">THADS BARBER • WORKSPACE</span>
            <h1 className="header-title">CA LÀM VIỆC CỦA TÔI</h1>
            <p className="header-desc">
              Lịch làm việc cố định theo tuần. Mọi thay đổi ca do Lễ tân hoặc Admin điều phối.
            </p>
          </div>
          <nav className="header-nav-tabs">
            <Link to="/barber/dashboard" className="nav-tab">
              Tổng quan
            </Link>
            <Link to="/barber/schedule" className="nav-tab">
              Lịch hẹn
            </Link>
            <Link to="/barber/working-schedule" className="nav-tab active">
              Ca làm việc
            </Link>
            <Link to="/barber/profile" className="nav-tab">
              Cá nhân
            </Link>
          </nav>
        </header>

        {/* Khối Thống Kê Ca Làm */}
        <div className="barber-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Số ngày làm việc/tuần</span>
            <span className="stat-value highlight-gold">{workingDaysCount} / 7 ngày</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Trạng thái tuần này</span>
            <span className="stat-value highlight-green">Đã phân lịch</span>
          </div>
        </div>

        {/* Lưới Hiển Thị Các Ngày Trong Tuần */}
        <div className="barber-week-grid">
          {items
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((item) => {
              const isToday = new Date().getDay() === item.dayOfWeek;
              return (
                <article
                  key={item.dayOfWeek}
                  className={`schedule-day-card ${!item.isWorking ? "off" : ""} ${
                    isToday ? "today" : ""
                  }`}
                >
                  {isToday && <span className="today-badge">HÔM NAY</span>}
                  <div className="day-name">{days[item.dayOfWeek]}</div>
                  <div className="day-status">
                    {item.isWorking ? (
                      <>
                        <span className="working-badge">Có ca làm</span>
                        <div className="time-range">
                          {item.startTime} – {item.endTime}
                        </div>
                        <small className="shift-note">Làm việc liên tục</small>
                      </>
                    ) : (
                      <>
                        <span className="off-badge">Nghỉ ca</span>
                        <div className="time-range off-text">Không có ca</div>
                        <small className="shift-note">—</small>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default WorkingSchedule;