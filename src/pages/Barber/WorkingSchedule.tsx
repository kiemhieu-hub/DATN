import { useCallback,useEffect,useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getMyBarberSchedule } from "../../services/baberSchedule.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";
import "./css/WorkingSchedule.css";
import "./css/Schedule.css";
const days=["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
function WorkingSchedule(){const navigate=useNavigate();const{user,isAuthenticated,isLoading}=useAuth("BARBER");const[items,setItems]=useState<BarberScheduleDay[]>([]);const[loading,setLoading]=useState(true);const load=useCallback(async()=>{try{const r=await getMyBarberSchedule();setItems(r.schedules);}finally{setLoading(false);}},[]);useEffect(()=>{if(isLoading)return;if(!isAuthenticated||!user){navigate("/barber/login",{replace:true});return;}void load();},[isLoading,isAuthenticated,user,navigate,load]);if(isLoading||loading)return <div className="barber-view-page">Đang tải...</div>;return <div className="barber-view-page"><main><header><div><span>THADS BARBER</span><h1>Ca làm việc của tôi</h1><p>Lịch chỉ đọc. Lễ tân và Admin chịu trách nhiệm điều phối.</p></div><nav><Link to="/barber/dashboard">Tổng quan</Link><Link to="/barber/schedule">Lịch hẹn</Link></nav></header><div className="barber-week-grid">{items.sort((a,b)=>a.dayOfWeek-b.dayOfWeek).map(item=><article key={item.dayOfWeek} className={!item.isWorking?"off":""}><span>{days[item.dayOfWeek]}</span>{item.isWorking?<><b>{item.startTime}–{item.endTime}</b><small>Làm việc xuyên trưa</small></>:<b>Nghỉ</b>}</article>)}</div></main></div>};export default WorkingSchedule;
