import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getBarberAppointments } from "../../services/barbarAppointment.service";
import type { Appointment, AppointmentStatus } from "../../types/Appoinment";
import "./css/Schedule.css";

const labels: Record<AppointmentStatus, string> = { PENDING:"Chờ xác nhận",CONFIRMED:"Đã xác nhận",CHECKED_IN:"Đã check-in",IN_PROGRESS:"Đang thực hiện",COMPLETED:"Đã hoàn thành",NO_SHOW:"Vắng mặt",CANCELLED:"Đã hủy" };
const money=(n:number)=>new Intl.NumberFormat("vi-VN").format(n);

function Schedule(){
  const navigate=useNavigate();
  const {user,isAuthenticated,isLoading}=useAuth("BARBER");
  const [items,setItems]=useState<Appointment[]>([]);const [date,setDate]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{try{setLoading(true);const response=await getBarberAppointments({appointmentDate:date||undefined});setItems(response.appointments);}catch(e){setError(axios.isAxiosError(e)?e.response?.data?.message||"Không thể tải lịch":"Không thể tải lịch");}finally{setLoading(false);}},[date]);
  useEffect(()=>{if(isLoading)return;if(!isAuthenticated||!user){navigate("/barber/login",{replace:true});return;}void load();},[isLoading,isAuthenticated,user,navigate,load]);
  if(isLoading||loading)return <div className="barber-view-page">Đang tải lịch làm việc...</div>;
  return <div className="barber-view-page"><main><header><div><span>THADS BARBER</span><h1>Lịch hẹn được phân công</h1><p>Barber chỉ được xem lịch, mọi thay đổi do lễ tân hoặc Admin xử lý.</p></div><nav><Link to="/barber/dashboard">Tổng quan</Link><Link to="/barber/working-schedule">Ca làm việc</Link><Link to="/barber/profile">Cá nhân</Link></nav></header>{error&&<div className="barber-view-error">{error}</div>}<label className="barber-view-filter">Lọc ngày<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><div className="barber-view-table"><table><thead><tr><th>Mã lịch</th><th>Khách sử dụng</th><th>Ngày giờ</th><th>Dịch vụ</th><th>Giá trị</th><th>Trạng thái</th></tr></thead><tbody>{items.map(item=><tr key={item._id}><td>{item.appointmentCode||item._id.slice(-8)}</td><td>{item.customer?.fullName||"Khách hàng"}<small>{item.customer?.phone}</small></td><td>{item.appointmentDate}<small>{item.startTime}–{item.endTime}</small></td><td>{item.services.map(s=>s.nameSnapshot).join(", ")}</td><td>{money(item.totalPrice)}đ</td><td><span>{labels[item.status]}</span></td></tr>)}</tbody></table></div></main></div>;
}
export default Schedule;
