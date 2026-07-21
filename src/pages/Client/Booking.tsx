import axios from "axios";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAppointment,
  confirmAppointmentDeposit,
  getAvailableSlots,
  type AvailableSlot,
} from "../../services/appointment.service";
import type { Appointment } from "../../types/Appointment";
import {
  getCatalogBarbers,
  getCatalogServices,
} from "../../services/catalog.service";
import type {
  CatalogBarber,
  CatalogService,
  ServiceGroup,
  ServiceStaffType,
} from "../../types/Catalog";
import { validateVoucher } from "../../services/voucher.service";
import type { VoucherCalculation } from "../../types/Voucher";
import "./css/Booking.css";
import "./css/BookingDeposit.css";

const groupNames: Record<ServiceGroup, string> = {
  HAIRCUT: "Cắt tóc",
  BEARD: "Chăm sóc râu",
  COLOR: "Nhuộm tóc",
  CARE: "Chăm sóc thư giãn",
  OTHER: "Uốn và tạo kiểu",
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const dateValue = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || "Có lỗi xảy ra";
  }
  return "Có lỗi xảy ra";
};

function Booking() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth("CLIENT");

  const [services, setServices] = useState<CatalogService[]>([]);
  const [barbers, setBarbers] = useState<CatalogBarber[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [hairBarberId, setHairBarberId] = useState("");
  const [careBarberId, setCareBarberId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherCalculation, setVoucherCalculation] = useState<VoucherCalculation | null>(null);
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [depositAppointment, setDepositAppointment] = useState<Appointment | null>(null);

  const today = useMemo(() => dateValue(new Date()), []);
  const maxDate = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 14);
    return dateValue(value);
  }, []);

  useEffect(() => {
    if (user) {
      setCustomerName(user.fullName);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    Promise.all([getCatalogServices(), getCatalogBarbers()])
      .then(([serviceResponse, barberResponse]) => {
        setServices(serviceResponse.services);
        setBarbers(barberResponse.barbers);
      })
      .catch((requestError) => setError(getError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const selectedServices = useMemo(
    () => services.filter((service) => serviceIds.includes(service.id)),
    [services, serviceIds]
  );

  const needsHair = selectedServices.some((service) => service.staffType === "HAIR");
  const needsCare = selectedServices.some((service) => service.staffType === "CARE");

  const barberSupports = (barber: CatalogBarber, type: ServiceStaffType) => {
    const required = selectedServices.filter((service) => service.staffType === type);
    const specialtyIds = new Set(barber.profile.specialties.map((item) => item._id));
    return barber.profile.staffType === type && required.every((service) => specialtyIds.has(service.id));
  };

  const hairBarbers = barbers.filter((barber) => barberSupports(barber, "HAIR"));
  const careBarbers = barbers.filter((barber) => barberSupports(barber, "CARE"));

  const slotBarberId = needsHair ? hairBarberId : careBarberId;

  useEffect(() => {
    setStartTime("");
    if (!slotBarberId || !appointmentDate || serviceIds.length === 0) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    getAvailableSlots(slotBarberId, serviceIds, appointmentDate)
      .then((response) => setSlots(response.slots))
      .catch((requestError) => {
        setSlots([]);
        setError(getError(requestError));
      })
      .finally(() => setSlotsLoading(false));
  }, [slotBarberId, appointmentDate, serviceIds]);

  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const discountPercent = voucherCalculation?.discountPercent ?? 0;
  const discountAmount = voucherCalculation?.discountAmount ?? 0;
  const total = voucherCalculation?.total ?? subtotal;
  const depositRequired = total > 200000;
  const depositAmount = depositRequired ? Math.round(total * 0.3) : 0;

  const toggleService = (service: CatalogService) => {
    setError("");
    setHairBarberId("");
    setCareBarberId("");
    setStartTime("");
    setVoucherCode("");
    setVoucherCalculation(null);
    setVoucherMessage("");
    setServiceIds((current) => {
      if (current.includes(service.id)) return current.filter((id) => id !== service.id);
      if (!service.isExclusiveInGroup) return [...current, service.id];
      return [
        ...current.filter((id) => {
          const item = services.find((candidate) => candidate.id === id);
          return !(item?.group === service.group && item.isExclusiveInGroup);
        }),
        service.id,
      ];
    });
  };

  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherCode("");
      setVoucherCalculation(null);
      setVoucherMessage("Vui lòng nhập mã voucher.");
      return;
    }
    if (!serviceIds.length) {
      setVoucherMessage("Vui lòng chọn dịch vụ trước khi áp dụng voucher.");
      return;
    }

    try {
      setVoucherApplying(true);
      setVoucherMessage("");
      const barberIds = [hairBarberId, careBarberId].filter(Boolean);
      const response = await validateVoucher(code, serviceIds, barberIds);
      setVoucherCode(response.calculation.code);
      setVoucherCalculation(response.calculation);
      setVoucherMessage(`${response.message}. Bạn được giảm ${money(response.calculation.discountAmount)}đ.`);
    } catch (requestError) {
      setVoucherCode("");
      setVoucherCalculation(null);
      setVoucherMessage(getError(requestError));
    } finally {
      setVoucherApplying(false);
    }
  };

  const changeBarber = (
    setter: (id: string) => void,
    id: string
  ) => {
    setter(id);
    setVoucherCode("");
    setVoucherCalculation(null);
    setVoucherMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isAuthenticated || !user) return navigate("/login");
    if (!serviceIds.length) return setError("Vui lòng chọn ít nhất một dịch vụ.");
    if (needsHair && !hairBarberId) return setError("Vui lòng chọn nhân viên làm tóc.");
    if (needsCare && !careBarberId) return setError("Vui lòng chọn nhân viên chăm sóc.");
    if (needsHair && needsCare && hairBarberId === careBarberId) return setError("Hai nhóm dịch vụ phải do hai nhân viên khác nhau thực hiện.");
    if (!appointmentDate || !startTime) return setError("Vui lòng chọn ngày và khung giờ.");
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) return setError("Vui lòng nhập đầy đủ thông tin người sử dụng dịch vụ.");

    try {
      setSubmitting(true);
      const response = await createAppointment({
        barberId: needsHair ? hairBarberId : careBarberId,
        careBarberId: needsCare ? careBarberId : undefined,
        serviceIds,
        appointmentDate,
        startTime,
        voucherCode: voucherCode || undefined,
        note: note.trim(),
        customer: {
          fullName: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone.trim(),
        },
      });
      if (response.appointment.depositRequired) {
        setDepositAppointment(response.appointment);
        return;
      }
      navigate("/booking-history", {
        replace: true,
        state: { message: "Đặt lịch thành công. Email xác nhận đang được gửi đến khách hàng." },
      });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <div className="booking-page"><p className="booking-loading">Đang tải trang đặt lịch...</p></div>;
  if (!isAuthenticated || !user) return (
    <div className="booking-page"><div className="booking-login-required"><h1>Bạn chưa đăng nhập</h1><Link to="/login">Đăng nhập để đặt lịch</Link></div></div>
  );

  const groups = Object.keys(groupNames) as ServiceGroup[];

  const finishDeposit = async () => {
    if (!depositAppointment) return;
    try {
      setSubmitting(true);
      await confirmAppointmentDeposit(depositAppointment._id);
      navigate("/booking-history", {
        replace: true,
        state: { message: "Đặt lịch và thanh toán cọc thành công. Email xác nhận đang được gửi." },
      });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <form className="booking-layout" onSubmit={submit}>
        <main className="booking-main">
          <header className="booking-header"><span>THADS BARBER</span><h1>Đặt lịch dịch vụ</h1><p>Chọn dịch vụ trước, hệ thống sẽ hiển thị đúng nhân viên có chuyên môn.</p></header>
          {error && <div className="booking-alert">{error}</div>}

          <section className="booking-panel">
            <div className="booking-panel-title"><b>01</b><div><h2>Chọn dịch vụ</h2><p>Bấm vào hình ảnh hoặc thông tin dịch vụ để lựa chọn.</p></div></div>
            {groups.map((group) => {
              const groupServices = services.filter((service) => service.group === group);
              if (!groupServices.length) return null;
              return <div className="booking-service-group" key={group}><h3>{groupNames[group]}</h3><div className="booking-service-grid">
                {groupServices.map((service) => {
                  const selected = serviceIds.includes(service.id);
                  return <button type="button" key={service.id} className={`booking-service-card ${selected ? "selected" : ""}`} onClick={() => toggleService(service)}>
                    <div className="booking-service-image">{service.image ? <img src={service.image} alt={service.name} /> : <span>THADS</span>}</div>
                    <div><strong>{service.name}</strong><p>{service.description}</p><small>{service.durationMinutes} phút · {money(service.price)}đ</small></div><i>{selected ? "✓" : "+"}</i>
                  </button>;
                })}
              </div></div>;
            })}
          </section>

          {serviceIds.length > 0 && <section className="booking-panel">
            <div className="booking-panel-title"><b>02</b><div><h2>Chọn nhân viên</h2><p>Dịch vụ làm tóc và chăm sóc được phân cho nhân viên khác nhau.</p></div></div>
            {needsHair && <BarberPicker title="Nhân viên làm tóc" items={hairBarbers} value={hairBarberId} onChange={(id) => changeBarber(setHairBarberId, id)} />}
            {needsCare && <BarberPicker title="Nhân viên gội đầu & chăm sóc" items={careBarbers} value={careBarberId} onChange={(id) => changeBarber(setCareBarberId, id)} />}
          </section>}

          <section className="booking-panel">
            <div className="booking-panel-title"><b>03</b><div><h2>Thông tin khách sử dụng</h2><p>Có thể sửa để đặt lịch hộ người khác.</p></div></div>
            <div className="booking-fields"><label>Họ và tên<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label><label>Số điện thoại<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></label><label>Email<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></label></div>
          </section>

          <section className="booking-panel">
            <div className="booking-panel-title"><b>04</b><div><h2>Chọn thời gian</h2><p>Chỉ nhận lịch từ hôm nay đến tối đa 14 ngày tiếp theo.</p></div></div>
            <label className="booking-date">Ngày hẹn<input type="date" min={today} max={maxDate} value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} /></label>
            <div className="booking-slots">{slotsLoading ? <p>Đang tải khung giờ...</p> : slots.map((slot) => <button type="button" key={slot.startTime} disabled={!slot.available} title={slot.reason} className={`${startTime === slot.startTime ? "selected" : ""} ${!slot.available ? "occupied" : ""}`} onClick={() => setStartTime(slot.startTime)}>{slot.startTime}<small>{slot.endTime}</small></button>)}</div>
            <label className="booking-note">Ghi chú<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yêu cầu kiểu tóc hoặc lưu ý khác..." /></label>
          </section>
        </main>

        <aside className="booking-summary">
          <span>ĐƠN ĐẶT LỊCH</span><h2>Dịch vụ đã chọn</h2>
          {!selectedServices.length ? <p className="booking-summary-empty">Chưa chọn dịch vụ.</p> : <ul>{selectedServices.map((service) => <li key={service.id}><div><b>{service.name}</b><small>{service.durationMinutes} phút</small></div><strong>{money(service.price)}đ</strong></li>)}</ul>}
          <div className="booking-voucher"><label>Mã voucher</label><div><input value={voucherInput} onChange={(e) => setVoucherInput(e.target.value.toUpperCase())} placeholder="Nhập mã voucher" /><button type="button" disabled={voucherApplying} onClick={() => void applyVoucher()}>{voucherApplying ? "Đang kiểm tra..." : "Áp dụng"}</button></div>{voucherMessage && <small>{voucherMessage}</small>}</div>
          <div className="booking-totals"><p><span>Tạm tính</span><b>{money(subtotal)}đ</b></p>{discountAmount > 0 && <p className="discount"><span>{discountPercent > 0 ? `Giảm ${discountPercent}%` : `Voucher ${voucherCode}`}</span><b>-{money(discountAmount)}đ</b></p>}<p className="grand-total"><span>Tổng cộng</span><b>{money(total)}đ</b></p></div>
          <div className={`booking-deposit ${depositRequired ? "required" : "free"}`}>{depositRequired ? <><b>Cần đặt cọc 30%</b><strong>{money(depositAmount)}đ</strong><p>Thanh toán tiền cọc để giữ lịch.</p></> : <><b>Không cần đặt cọc</b><p>Giá trị sau giảm không vượt quá 200.000đ.</p></>}</div>
          <button className="booking-submit" disabled={submitting}>{submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}</button>
          <Link className="booking-history-link" to="/booking-history">Xem lịch đã đặt</Link>
        </aside>
      </form>
      {depositAppointment && (
        <div className="booking-deposit-modal">
          <section>
            <h2>Thanh toán đặt cọc 30%</h2>
            <p>Mã lịch: <b>{depositAppointment.appointmentCode}</b></p>
            <strong>{money(depositAppointment.depositAmount)}đ</strong>
            <img alt="QR đặt cọc" src={`https://api.qrserver.com/v1/create-qr-code/?size=230x230&data=${encodeURIComponent(`THADS-DEPOSIT|${depositAppointment.appointmentCode}|${depositAppointment.depositAmount}`)}`} />
            <p>Quét mã để chuyển khoản, sau đó xác nhận bên dưới.</p>
            <button type="button" disabled={submitting} onClick={() => void finishDeposit()}>{submitting ? "Đang xác nhận..." : "Tôi đã thanh toán cọc"}</button>
          </section>
        </div>
      )}
    </div>
  );
}

function BarberPicker({ title, items, value, onChange }: { title: string; items: CatalogBarber[]; value: string; onChange: (id: string) => void }) {
  return <div className="booking-barber-picker"><h3>{title}</h3>{!items.length ? <p>Chưa có nhân viên phù hợp với toàn bộ dịch vụ đã chọn.</p> : <div>{items.map((barber) => <button type="button" key={barber.id} className={value === barber.id ? "selected" : ""} onClick={() => onChange(barber.id)}>{barber.profile.avatar ? <img src={barber.profile.avatar} alt={barber.fullName} /> : <span>{barber.fullName.charAt(0)}</span>}<b>{barber.fullName}</b><small>{barber.profile.experienceYears} năm kinh nghiệm</small></button>)}</div>}</div>;
}

export default Booking;
