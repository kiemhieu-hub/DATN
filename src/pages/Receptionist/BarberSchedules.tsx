import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getReceptionBarberSchedules,
  saveReceptionBarberSchedule,
  type ReceptionBarberSchedule,
} from "../../services/receptionist.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";
import "./Receptionist.css";
import {Link} from "react-router-dom";

const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const normalize = (items: BarberScheduleDay[]) =>
  Array.from({ length: 7 }, (_, dayOfWeek) =>
    items.find((item) => item.dayOfWeek === dayOfWeek) || {
      dayOfWeek,
      startTime: "09:00",
      endTime: "21:00",
      isWorking: dayOfWeek !== 0,
      breaks: [],
    }
  );

function BarberSchedules() {
  const navigate = useNavigate();
  const isAdminPage = window.location.pathname.startsWith("/admin");
  const role = isAdminPage ? "ADMIN" : "RECEPTIONIST";
  const { user, isAuthenticated, isLoading } = useAuth(role);
  const [items, setItems] = useState<ReceptionBarberSchedule[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      navigate(isAdminPage ? "/admin/login" : "/receptionist/login");
      return;
    }
    getReceptionBarberSchedules().then((response) =>
      setItems(response.items.map((item) => ({ ...item, schedules: normalize(item.schedules) })))
    );
  }, [isLoading, isAuthenticated, user, navigate, isAdminPage]);

  const change = (
    barberIndex: number,
    dayIndex: number,
    key: "startTime" | "endTime" | "isWorking",
    value: string | boolean
  ) => setItems((current) => current.map((item, index) =>
    index !== barberIndex ? item : {
      ...item,
      schedules: item.schedules.map((day, currentDayIndex) =>
        currentDayIndex !== dayIndex ? day : { ...day, [key]: value, breaks: [] }
      ),
    }
  ));

  return <div className="reception-page reception-page-embedded">
    <main className="reception-main" style={{ marginLeft: 0, width: "100%" }}>
      <header><div><h1>Lịch làm việc Barber</h1><p>Lễ tân và Admin có thể thay đổi ca làm. Không sử dụng giờ nghỉ trưa.</p></div></header>
      <Link to= {"/receptionist/dashboard"}>Quay lại</Link>
      {message && <div className="reception-alert success">{message}</div>}
      <div className="reception-schedule-list">{items.map((item, barberIndex) =>
        <section key={item.barber._id}><h2>{item.barber.fullName}</h2><p>{item.barber.phone} · {item.barber.email}</p>
          <div>{item.schedules.map((day, dayIndex) => <article key={day.dayOfWeek}><b>{days[day.dayOfWeek]}</b><label><input type="checkbox" checked={day.isWorking} onChange={(event) => change(barberIndex, dayIndex, "isWorking", event.target.checked)} /> Làm việc</label><input type="time" value={day.startTime} disabled={!day.isWorking} onChange={(event) => change(barberIndex, dayIndex, "startTime", event.target.value)} /><input type="time" value={day.endTime} disabled={!day.isWorking} onChange={(event) => change(barberIndex, dayIndex, "endTime", event.target.value)} /></article>)}</div>
          <button onClick={() => saveReceptionBarberSchedule(item.barber._id, item.schedules).then(() => setMessage(`Đã lưu lịch của ${item.barber.fullName}`))}>Lưu lịch làm việc</button>
        </section>)}</div>
    </main>
  </div>;
}

export default BarberSchedules;
