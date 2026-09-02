import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getMyBarberSchedule } from "../../services/barberSchedule.service";
import type { BarberUpcomingScheduleDay } from "../../types/BarberSchedule";
import "./css/WorkingSchedule.css";
import "./css/Schedule.css";

const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function WorkingSchedule() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth("BARBER");
  const [items, setItems] = useState<BarberUpcomingScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedRange, setAppliedRange] = useState({ from: "", to: "" });
  const [filterError, setFilterError] = useState("");

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

  const visibleItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((item) => {
          if (appliedRange.from && item.date < appliedRange.from) return false;
          if (appliedRange.to && item.date > appliedRange.to) return false;
          return true;
        }),
    [items, appliedRange]
  );

  const handleSearch = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setFilterError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }
    setFilterError("");
    setAppliedRange({ from: dateFrom, to: dateTo });
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedRange({ from: "", to: "" });
    setFilterError("");
  };

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
            <p className="barber-page-desc">Lịch làm việc 14 ngày sắp tới, từ ngày gần nhất đến xa nhất.</p>
          </div>
          <nav className="barber-nav-actions">
            <Link to="/barber/dashboard" className="barber-nav-btn">Dashboard</Link>
            <Link to="/barber/schedule" className="barber-nav-btn">Lịch hẹn</Link>
            <Link to="/barber/profile" className="barber-nav-btn">Cá nhân</Link>
          </nav>
        </header>

        <section className="working-schedule-filters" aria-label="Lọc lịch làm việc theo ngày">
          <div className="schedule-filter-field">
            <label htmlFor="schedule-date-from">Từ ngày</label>
            <input id="schedule-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div className="schedule-filter-field">
            <label htmlFor="schedule-date-to">Đến ngày</label>
            <input id="schedule-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          <div className="schedule-filter-actions">
            <button type="button" className="schedule-search-btn" onClick={handleSearch}>Tìm kiếm</button>
            <button type="button" className="schedule-reset-btn" onClick={handleReset}>Đặt lại</button>
          </div>
          {filterError && <p className="schedule-filter-error" role="alert">{filterError}</p>}
        </section>

        <section className="barber-content-card">
          <div className="working-schedule-table">
            <div className="working-schedule-table-head" aria-hidden="true">
              <span>Ngày làm việc</span>
              <span>Ca làm</span>
              <span>Ghi chú</span>
              <span>Trạng thái</span>
            </div>
            <div className="working-schedule-table-body">
              {visibleItems.map((item) => (
                <article key={item.date} className={`working-schedule-row ${item.isWorking ? "is-working" : "is-off"}`}>
                  <div className="working-date-cell" data-label="Ngày làm việc">
                    <strong>{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${item.date}T00:00:00`))}</strong>
                    <span>{days[item.dayOfWeek]}</span>
                  </div>
                  <div className="working-shift-cell" data-label="Ca làm">
                    {item.isWorking ? <strong>{item.startTime} – {item.endTime}</strong> : <strong>—</strong>}
                  </div>
                  <div className="working-note-cell" data-label="Ghi chú">
                    {item.note || (item.isWorking ? (item.source === "OVERRIDE" ? "Lịch điều chỉnh theo ngày" : "Ca làm việc") : "Không làm việc")}
                  </div>
                  <div className="working-status-cell" data-label="Trạng thái">
                    <span className={`status-pill ${item.isWorking ? "working" : "off"}`}>{item.isWorking ? "Đi làm" : "Nghỉ"}</span>
                  </div>
                </article>
              ))}
              {visibleItems.length === 0 && <div className="working-schedule-empty">Không có lịch làm việc trong khoảng ngày đã chọn.</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WorkingSchedule;
