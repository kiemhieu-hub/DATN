import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  changeAdminAppointmentBarber,
  getAdminAppointments,
  rescheduleAdminAppointment,
  updateAdminAppointmentServices,
  updateAdminAppointmentStatus,
} from "../../services/adminAppointment.service";
import { getCatalogBarbers, getCatalogServices } from "../../services/catalog.service";
import { confirmBankTransfer, confirmCashPayment } from "../../services/payment.service";
import type { Appointment, AppointmentStatus } from "../../types/Appointment";
import type { CatalogBarber, CatalogService } from "../../types/Catalog";
import "./Receptionist.css";

const labels: Record<AppointmentStatus, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang làm", COMPLETED: "Hoàn thành", NO_SHOW: "Vắng mặt", CANCELLED: "Đã hủy",
};
const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const errorText = (error: unknown) => axios.isAxiosError(error) ? (error.response?.data as { message?: string })?.message || "Có lỗi xảy ra" : "Có lỗi xảy ra";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin/");
  const role = isAdminPage ? "ADMIN" : "RECEPTIONIST";
  const { user, isAuthenticated, isLoading, logout } = useAuth(role);
  const [items, setItems] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<CatalogBarber[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<{ appointment: Appointment; method: "CASH" | "BANK_TRANSFER" } | null>(null);

  const load = useCallback(async () => {
    try { const response = await getAdminAppointments({ limit: 100 }); setItems(response.items); }
    catch (requestError) { setError(errorText(requestError)); }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate(isAdminPage ? "/admin/login" : "/receptionist/login", { replace: true }); return; }
    void Promise.all([load(), getCatalogBarbers().then((r) => setBarbers(r.barbers)), getCatalogServices().then((r) => setServices(r.services))]);
  }, [isLoading, isAuthenticated, user, navigate, load]);

  const mutate = async (action: () => Promise<{ message: string; appointment: Appointment }>) => {
    try { setError(""); const response = await action(); setMessage(response.message); setDetail(response.appointment); await load(); }
    catch (requestError) { setError(errorText(requestError)); }
  };

  const status = (item: Appointment, target: AppointmentStatus) => {
    let reason: string | undefined;
    if (target === "CANCELLED") { reason = window.prompt("Lý do hủy lịch:") || undefined; if (!reason) return; }
    void mutate(() => updateAdminAppointmentStatus(item._id, target, reason));
  };

  const changeBarber = (item: Appointment) => {
    const barberId = window.prompt("Nhập ID Barber thay thế:");
    if (barberId) void mutate(() => changeAdminAppointmentBarber(item._id, barberId));
  };

  const reschedule = (item: Appointment) => {
    const date = window.prompt("Ngày mới (YYYY-MM-DD):", item.appointmentDate);
    const time = window.prompt("Giờ mới (HH:mm):", item.startTime);
    if (date && time && window.confirm("Khách hàng đã đồng ý đổi lịch?")) void mutate(() => rescheduleAdminAppointment(item._id, date, time, true));
  };

  const editServices = (item: Appointment) => {
    const current = item.services.map((service) => typeof service.service === "string" ? service.service : service.service._id).join(",");
    const value = window.prompt("Nhập các ID dịch vụ, cách nhau bằng dấu phẩy:", current);
    if (value) void mutate(() => updateAdminAppointmentServices(item._id, value.split(",").map((id) => id.trim()).filter(Boolean)));
  };

  const pay = async (item: Appointment, method: "CASH" | "BANK_TRANSFER") => {
    try {
      setError("");
      const response = method === "CASH" ? await confirmCashPayment(item._id) : await confirmBankTransfer(item._id);
      setMessage(response.message); setReceipt({ appointment: response.appointment, method }); await load();
    } catch (requestError) { setError(errorText(requestError)); }
  };

  if (isLoading) return <div className="reception-page">Đang tải...</div>;

  return <div className="reception-page"><aside className="reception-sidebar"><h2>THADS</h2><span>LỄ TÂN</span><nav><a href="#appointments">Lịch hẹn</a><a href="/receptionist/barbers">Lịch Barber</a></nav><button onClick={() => { logout(); navigate("/receptionist/login"); }}>Đăng xuất</button></aside><main className="reception-main"><header><div><h1>Điều phối lịch hẹn</h1><p>Xác nhận, check-in, đổi lịch, dịch vụ phát sinh và thanh toán.</p></div><b>{user?.fullName}</b></header>{error && <div className="reception-alert error">{error}</div>}{message && <div className="reception-alert success">{message}</div>}<section className="reception-stats"><article><span>Tổng lịch</span><b>{items.length}</b></article><article><span>Chờ xác nhận</span><b>{items.filter((i) => i.status === "PENDING").length}</b></article><article><span>Đã check-in</span><b>{items.filter((i) => i.status === "CHECKED_IN").length}</b></article><article><span>Vắng mặt</span><b>{items.filter((i) => i.status === "NO_SHOW").length}</b></article></section><div className="reception-table" id="appointments"><table><thead><tr><th>Mã lịch</th><th>Khách hàng</th><th>Thời gian</th><th>Barber</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><b>{item.appointmentCode || item._id.slice(-8)}</b></td><td>{item.customer?.fullName || "Chưa có"}<small>{item.customer?.phone}<br />{item.customer?.email}</small></td><td>{item.appointmentDate}<small>{item.startTime}–{item.endTime}</small></td><td>{typeof item.barber === "string" ? item.barber : item.barber.fullName}</td><td>{money(item.totalPrice)}đ</td><td><span className={`reception-status ${item.status.toLowerCase()}`}>{labels[item.status]}</span></td><td><div className="reception-actions"><button onClick={() => setDetail(item)}>Chi tiết</button>{item.status === "PENDING" && <button onClick={() => status(item, "CONFIRMED")}>Xác nhận</button>}{item.status === "CONFIRMED" && <><button onClick={() => status(item, "CHECKED_IN")}>Check-in</button><button onClick={() => status(item, "NO_SHOW")}>Vắng mặt</button><button onClick={() => status(item, "CANCELLED")}>Hủy</button></>}{item.status === "CHECKED_IN" && <button onClick={() => status(item, "IN_PROGRESS")}>Bắt đầu</button>}{item.status === "NO_SHOW" && <button onClick={() => status(item, "IN_PROGRESS")}>Bật lại</button>}{item.status === "IN_PROGRESS" && <><button onClick={() => editServices(item)}>Sửa dịch vụ</button><button onClick={() => status(item, "COMPLETED")}>Hoàn thành</button></>} {!['COMPLETED','CANCELLED'].includes(item.status) && <><button onClick={() => reschedule(item)}>Đổi lịch</button><button onClick={() => changeBarber(item)}>Đổi Barber</button></>}{['IN_PROGRESS','COMPLETED'].includes(item.status) && item.paymentStatus !== "PAID" && <><button onClick={() => void pay(item, "CASH")}>Tiền mặt</button><button onClick={() => void pay(item, "BANK_TRANSFER")}>Chuyển khoản</button></>}</div></td></tr>)}</tbody></table></div></main>{detail && <div className="reception-modal-bg" onMouseDown={() => setDetail(null)}><section className="reception-modal" onMouseDown={(e) => e.stopPropagation()}><button onClick={() => setDetail(null)}>×</button><h2>{detail.appointmentCode}</h2><p><b>Khách:</b> {detail.customer?.fullName} · {detail.customer?.phone} · {detail.customer?.email}</p><p><b>Dịch vụ:</b> {detail.services.map((s) => s.nameSnapshot).join(", ")}</p><p><b>Voucher:</b> {detail.voucherCode || "Không có"} · <b>Tổng:</b> {money(detail.totalPrice)}đ</p><p><b>Đặt cọc:</b> {detail.depositRequired ? `${money(detail.depositAmount)}đ` : "Không yêu cầu"}</p><h3>Barber phù hợp</h3><ul>{barbers.map((b) => <li key={b.id}>{b.fullName} — {b.profile.staffType}</li>)}</ul><small>{services.length} dịch vụ đang hoạt động</small></section></div>}{receipt && <div className="reception-modal-bg"><section className="reception-receipt"><h2>HÓA ĐƠN THADS BARBER</h2><p>Mã lịch: {receipt.appointment.appointmentCode}</p><p>Khách hàng: {receipt.appointment.customer?.fullName}</p><ul>{receipt.appointment.services.map((s) => <li key={s.nameSnapshot}>{s.nameSnapshot}<b>{money(s.priceSnapshot)}đ</b></li>)}</ul><h3>Tổng: {money(receipt.appointment.totalPrice)}đ</h3>{receipt.method === "BANK_TRANSFER" && <img alt="QR chuyển khoản" src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`THADS|${receipt.appointment.appointmentCode}|${receipt.appointment.totalPrice}`)}`} />}<p>{receipt.method === "CASH" ? "Đã thanh toán tiền mặt" : "Đã thanh toán chuyển khoản"}</p><button onClick={() => window.print()}>In hóa đơn</button><button onClick={() => setReceipt(null)}>Đóng</button></section></div>}</div>;
}

export default Dashboard;
