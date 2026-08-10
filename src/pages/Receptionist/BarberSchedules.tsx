import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getReceptionBarberDayDetail,
  getReceptionBarberSchedules,
  removeReceptionDateOverride,
  saveReceptionBarberSchedule,
  saveReceptionDateOverride,
  type ReceptionBarberSchedule,
} from "../../services/receptionist.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";
import "./Receptionist.css";

const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const localDate = (date = new Date()) => new Date(date.getTime()-date.getTimezoneOffset()*60_000).toISOString().slice(0,10);
const normalize = (items: BarberScheduleDay[]) => Array.from({length:7},(_,dayOfWeek)=>items.find((item)=>item.dayOfWeek===dayOfWeek)||{dayOfWeek,startTime:"09:00",endTime:"21:00",isWorking:dayOfWeek!==0,breaks:[]});

type OverrideDraft = {date:string;startTime:string;endTime:string;isWorking:boolean;note:string;source?:"WEEKLY"|"OVERRIDE"};

function BarberSchedules() {
  const navigate=useNavigate();
  const isAdminPage=window.location.pathname.startsWith("/admin");
  const {user,isAuthenticated,isLoading}=useAuth(isAdminPage?"ADMIN":"RECEPTIONIST");
  const [items,setItems]=useState<ReceptionBarberSchedule[]>([]);
  const [selected,setSelected]=useState("");
  const [draft,setDraft]=useState<OverrideDraft>({date:localDate(),startTime:"09:00",endTime:"21:00",isWorking:true,note:""});
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [saving,setSaving]=useState(false);

  useEffect(()=>{if(isLoading)return;if(!isAuthenticated||!user){navigate(isAdminPage?"/admin/login":"/receptionist/login");return;}getReceptionBarberSchedules().then(({items})=>{const result=items.map((item)=>({...item,schedules:normalize(item.schedules)}));setItems(result);if(result[0])setSelected(result[0].barber._id);}).catch(()=>setError("Không thể tải lịch Barber"));},[isLoading,isAuthenticated,user,navigate,isAdminPage]);
  useEffect(()=>{if(!selected)return;getReceptionBarberDayDetail(selected,draft.date).then((result)=>setDraft((current)=>({...current,startTime:result.schedule?.startTime||"09:00",endTime:result.schedule?.endTime||"21:00",isWorking:result.schedule?.isWorking??false,note:result.schedule?.note||"",source:result.source}))).catch(()=>setError("Không thể tải lịch ngày đã chọn"));},[selected,draft.date]);

  const changeWeek=(barberIndex:number,dayIndex:number,key:"startTime"|"endTime"|"isWorking",value:string|boolean)=>setItems((current)=>current.map((item,index)=>index!==barberIndex?item:{...item,schedules:item.schedules.map((day,currentDay)=>currentDay!==dayIndex?day:{...day,[key]:value,breaks:[]})}));
  const saveWeek=async(item:ReceptionBarberSchedule)=>{try{setSaving(true);setError("");await saveReceptionBarberSchedule(item.barber._id,item.schedules);setMessage(`Đã lưu lịch tuần mặc định của ${item.barber.fullName}`);}catch{setError("Không thể lưu lịch tuần");}finally{setSaving(false);}};
  const saveDate=async()=>{try{setSaving(true);setError("");await saveReceptionDateOverride(selected,draft);setDraft((d)=>({...d,source:"OVERRIDE"}));setMessage("Đã lưu lịch riêng cho ngày đã chọn");}catch{setError("Không thể lưu lịch riêng. Hãy kiểm tra khung giờ.");}finally{setSaving(false);}};
  const resetDate=async()=>{try{setSaving(true);await removeReceptionDateOverride(selected,draft.date);const result=await getReceptionBarberDayDetail(selected,draft.date);setDraft((d)=>({...d,startTime:result.schedule?.startTime||"09:00",endTime:result.schedule?.endTime||"21:00",isWorking:result.schedule?.isWorking??false,note:"",source:"WEEKLY"}));setMessage("Đã quay lại lịch tuần mặc định");}catch{setError("Không thể bỏ lịch riêng");}finally{setSaving(false);}};
  const selectedBarber=items.find((item)=>item.barber._id===selected);

  return <div className="reception-page reception-page-embedded"><main className="reception-main" style={{marginLeft:0,width:"100%"}}>
    <header className="schedule-page-heading"><div><p className="eyebrow">THADS BARBER</p><h1>Quản lý lịch làm việc Barber</h1><p>Lịch tuần là mẫu mặc định. Lịch riêng giúp đổi ca hoặc cho nghỉ đúng một ngày.</p></div><Link className="schedule-back" to={isAdminPage?"/admin/barber-day-schedule":"/receptionist/barber-day-schedule"}>Xem lịch hẹn chi tiết</Link></header>
    {message&&<div className="reception-alert success">{message}</div>}{error&&<div className="reception-alert error">{error}</div>}
    <section className="date-override-panel"><div className="override-title"><div><span className="eyebrow">LỊCH NGOẠI LỆ THEO NGÀY</span><h2>Điều chỉnh trước cho một ngày cụ thể</h2><p>Lịch này chỉ áp dụng cho ngày chọn, không làm thay đổi các tuần sau.</p></div><span className={`schedule-source ${(draft.source||"weekly").toLowerCase()}`}>{draft.source==="OVERRIDE"?"Đang dùng lịch riêng":"Đang theo lịch tuần"}</span></div>
      <div className="override-form"><label>Chọn Barber<select value={selected} onChange={(e)=>setSelected(e.target.value)}>{items.map((item)=><option key={item.barber._id} value={item.barber._id}>{item.barber.fullName}</option>)}</select></label><label>Ngày áp dụng<input type="date" min={localDate()} value={draft.date} onChange={(e)=>setDraft({...draft,date:e.target.value})}/></label><label className="working-toggle"><input type="checkbox" checked={draft.isWorking} onChange={(e)=>setDraft({...draft,isWorking:e.target.checked})}/><span>Làm việc ngày này</span></label><label>Giờ bắt đầu<input type="time" disabled={!draft.isWorking} value={draft.startTime} onChange={(e)=>setDraft({...draft,startTime:e.target.value})}/></label><label>Giờ kết thúc<input type="time" disabled={!draft.isWorking} value={draft.endTime} onChange={(e)=>setDraft({...draft,endTime:e.target.value})}/></label><label className="override-note">Ghi chú<input value={draft.note} placeholder="Ví dụ: việc cá nhân, đổi ca..." onChange={(e)=>setDraft({...draft,note:e.target.value})}/></label></div>
      <div className="override-actions"><button disabled={saving||!selected} onClick={saveDate}>Lưu lịch riêng</button>{draft.source==="OVERRIDE"&&<button className="secondary" disabled={saving} onClick={resetDate}>Dùng lại lịch tuần</button>}<span>{selectedBarber?.barber.fullName}</span></div>
    </section>
    <div className="weekly-heading"><div><span className="eyebrow">LỊCH TUẦN MẶC ĐỊNH</span><h2>Ca làm lặp lại hằng tuần</h2></div><p>Chỉ chỉnh phần này khi muốn thay đổi lịch lâu dài.</p></div>
    <div className="reception-schedule-list modern">{items.map((item,barberIndex)=><section key={item.barber._id}><div className="schedule-barber-title"><span className="barber-avatar">{item.barber.fullName.charAt(0)}</span><div><h2>{item.barber.fullName}</h2><p>{item.barber.phone} · {item.barber.email}</p></div></div><div className="weekly-grid">{item.schedules.map((day,dayIndex)=><article key={day.dayOfWeek} className={!day.isWorking?"day-off":""}><div className="day-card-title"><b>{days[day.dayOfWeek]}</b><label className="mini-switch"><input type="checkbox" checked={day.isWorking} onChange={(e)=>changeWeek(barberIndex,dayIndex,"isWorking",e.target.checked)}/><span>{day.isWorking?"Làm việc":"Nghỉ"}</span></label></div><div className="day-times"><label>Bắt đầu<input type="time" value={day.startTime} disabled={!day.isWorking} onChange={(e)=>changeWeek(barberIndex,dayIndex,"startTime",e.target.value)}/></label><label>Kết thúc<input type="time" value={day.endTime} disabled={!day.isWorking} onChange={(e)=>changeWeek(barberIndex,dayIndex,"endTime",e.target.value)}/></label></div></article>)}</div><button disabled={saving} onClick={()=>saveWeek(item)}>Lưu lịch tuần</button></section>)}</div>
  </main></div>;
}
export default BarberSchedules;
