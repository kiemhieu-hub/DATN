import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getReceptionBarberDayDetail,
  getReceptionBarberSchedules,
  type BarberDayDetail,
  type ReceptionBarberSchedule,
} from "../../services/receptionist.service";
import "./Receptionist.css";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { weekday:"long",day:"2-digit",month:"2-digit",year:"numeric" }).format(new Date(`${value}T00:00:00`));

function BarberDaySchedule() {
  const [params, setParams] = useSearchParams();
  const [barbers, setBarbers] = useState<ReceptionBarberSchedule[]>([]);
  const [detail, setDetail] = useState<BarberDayDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const barberId = params.get("barberId") || "";
  const date = params.get("date") || today();

  useEffect(() => {
    getReceptionBarberSchedules().then(({items}) => {
      setBarbers(items);
      if (!barberId && items[0]) setParams({barberId:items[0].barber._id,date},{replace:true});
    }).catch(() => setError("Không thể tải danh sách Barber"));
  }, []);

  useEffect(() => {
    if (!barberId) return;
    setLoading(true); setError("");
    getReceptionBarberDayDetail(barberId,date).then(setDetail).catch(() => setError("Không thể tải lịch chi tiết")).finally(() => setLoading(false));
  }, [barberId,date]);

  const bookedCount = useMemo(() => detail?.slots.filter((slot) => slot.booked).length || 0,[detail]);
  const changeFilter = (key:"barberId"|"date",value:string) => setParams({barberId:key==="barberId"?value:barberId,date:key==="date"?value:date});

  return <div className="reception-page reception-page-embedded schedule-detail-page"><main className="reception-main" style={{marginLeft:0,width:"100%"}}>
    <header className="schedule-page-heading"><div><p className="eyebrow">THADS BARBER</p><h1>Lịch hẹn chi tiết của Barber</h1><p>Xem ca làm và các khung giờ đã có khách theo từng ngày.</p></div><Link className="schedule-back" to="/receptionist/barbers">Chỉnh lịch làm việc</Link></header>
    <section className="schedule-filter-card">
      <label>Barber<select value={barberId} onChange={(e)=>changeFilter("barberId",e.target.value)}>{barbers.map((item)=><option key={item.barber._id} value={item.barber._id}>{item.barber.fullName}</option>)}</select></label>
      <label>Ngày cần xem<input type="date" value={date} onChange={(e)=>changeFilter("date",e.target.value)} /></label>
      <div className="schedule-filter-summary"><span>{formatDate(date)}</span><b>{bookedCount} khung đã có lịch</b></div>
    </section>
    {error && <div className="reception-alert error">{error}</div>}
    {loading ? <div className="schedule-state">Đang tải lịch...</div> : detail && <section className="barber-day-card">
      <div className="barber-day-header"><div><span className="barber-avatar">{detail.barber.fullName.charAt(0)}</span><div><h2>{detail.barber.fullName}</h2><p>{detail.barber.phone} · {detail.barber.email}</p></div></div><div className={`schedule-source ${detail.source.toLowerCase()}`}>{detail.source==="OVERRIDE"?"Lịch riêng theo ngày":"Lịch tuần mặc định"}</div></div>
      {!detail.schedule?.isWorking ? <div className="schedule-state off"><b>Barber nghỉ ngày này</b><span>Có thể chỉnh trong trang Lịch làm việc Barber.</span></div> : <>
        <div className="working-range"><span>Ca làm việc</span><strong>{detail.schedule.startTime} – {detail.schedule.endTime}</strong>{detail.schedule.note&&<small>{detail.schedule.note}</small>}</div>
        <div className="slot-legend"><span><i className="free"/>Còn trống</span><span><i className="busy"/>Đã có lịch</span></div>
        <div className="barber-slot-grid">{detail.slots.map((slot)=><article key={slot.startTime} className={slot.booked?"booked":"available"} title={slot.booked?`${slot.booking?.appointmentCode} · ${slot.booking?.customerName}`:"Khung giờ còn trống"}><strong>{slot.startTime}</strong><span>{slot.endTime}</span>{slot.booked&&<small>{slot.booking?.customerName}<br/>{slot.booking?.appointmentCode}</small>}</article>)}</div>
      </>}
    </section>}
  </main></div>;
}
export default BarberDaySchedule;
