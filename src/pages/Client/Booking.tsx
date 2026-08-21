import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAppointment,
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
import { getAvailableVouchers } from "../../services/voucher.service";
import type {
  AvailableVoucher,
  VoucherCalculation,
} from "../../types/Voucher";
import { createVnpayPayment } from "../../services/vnpay.service";
import ClientHeader from "../../components/ClientHeader";
import "./css/Booking.css";
import "./css/BookingDeposit.css";

const groupNames: Record<ServiceGroup, string> = {
  HAIRCUT: "Cắt tóc",
  BEARD: "Chăm sóc râu",
  COLOR: "Nhuộm tóc",
  CARE: "Chăm sóc tóc",
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
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherCalculation, setVoucherCalculation] = useState<VoucherCalculation | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<AvailableVoucher[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherOpen, setVoucherOpen] = useState(false);
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

  const loadCatalog = useCallback(() => {
    Promise.all([fetchBusinessQuery("catalog-services", () => getCatalogServices()), fetchBusinessQuery("catalog-barbers", () => getCatalogBarbers())])
      .then(([serviceResponse, barberResponse]) => {
        setServices(serviceResponse.services);
        setBarbers(barberResponse.barbers);
      })
      .catch((requestError) => setError(getError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useRealtimeRefresh(loadCatalog);

  const selectedServices = useMemo(
    () =>
      serviceIds
        .map((id) => services.find((service) => service.id === id))
        .filter((service): service is CatalogService => Boolean(service)),
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
  useEffect(() => {
    setStartTime("");
    if (
      (needsHair && !hairBarberId) ||
      !appointmentDate ||
      serviceIds.length === 0
    ) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetchBusinessQuery("booking-slots", () => getAvailableSlots(hairBarberId || undefined, serviceIds, appointmentDate), [hairBarberId || undefined, serviceIds, appointmentDate])
      .then((response) => setSlots(response.slots))
      .catch((requestError) => {
        setSlots([]);
        setError(getError(requestError));
      })
      .finally(() => setSlotsLoading(false));
  }, [needsHair, hairBarberId, appointmentDate, serviceIds]);

  useRealtimeRefresh(() => {
    if (
      appointmentDate &&
      serviceIds.length > 0 &&
      (!needsHair || hairBarberId)
    ) {
      void getAvailableSlots(
        hairBarberId || undefined,
        serviceIds,
        appointmentDate
      )
        .then((response) => setSlots(response.slots))
        .catch(() => undefined);
    }
  });

  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const hairDuration = selectedServices
    .filter((service) => service.staffType === "HAIR")
    .reduce((sum, service) => sum + service.durationMinutes, 0);
  const careDuration = selectedServices
    .filter((service) => service.staffType === "CARE")
    .reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalDuration = hairDuration + careDuration;
  const total = voucherCalculation?.total ?? subtotal;
  const depositRequired = total > 200000;
  const depositAmount = depositRequired ? Math.round(total * 0.3) : 0;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}p`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h${remainingMinutes}p` : `${hours}h`;
  };

  const toggleService = (service: CatalogService) => {
    setError("");
    setHairBarberId("");
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

  useEffect(() => {
    if (!serviceIds.length) {
      setAvailableVouchers([]);
      return;
    }

    const timer = window.setTimeout(() => {
      fetchBusinessQuery("available-vouchers", () => getAvailableVouchers(
        serviceIds,
        [hairBarberId].filter(Boolean)
      ), [
        serviceIds,
        [hairBarberId].filter(Boolean)
      ])
        .then((response) => setAvailableVouchers(response.vouchers))
        .catch(() => setAvailableVouchers([]));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [hairBarberId, serviceIds]);

  const chooseVoucher = (voucher: AvailableVoucher): void => {
    setVoucherCode(voucher.code);
    setVoucherCalculation(voucher);
    setVoucherMessage(`Đã áp dụng ${voucher.code}: giảm ${money(voucher.discountAmount)}đ.`);
    setVoucherOpen(false);
  };

  const clearVoucher = (): void => {
    setVoucherCode("");
    setVoucherCalculation(null);
    setVoucherMessage("");
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
    if (!appointmentDate || !startTime) return setError("Vui lòng chọn ngày và khung giờ.");
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) return setError("Vui lòng nhập đầy đủ thông tin người sử dụng dịch vụ.");

    try {
      setSubmitting(true);
      const response = await createAppointment({
        barberId: needsHair ? hairBarberId : "",
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
      const payment = await createVnpayPayment(
        depositAppointment._id,
        "DEPOSIT"
      );
      window.location.assign(payment.paymentUrl);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <><ClientHeader /><div className="booking-page">
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
            <div className="booking-panel-title"><b>02</b><div><h2>Chọn ngày và Barber</h2><p>Chọn ngày trước, sau đó chọn Barber còn lịch phù hợp.</p></div></div>
            <label className="booking-date">Ngày hẹn<input type="date" min={today} max={maxDate} value={appointmentDate} onChange={(e) => { setAppointmentDate(e.target.value); setHairBarberId(""); }} /></label>
            {needsHair && <BarberPicker title="Nhân viên làm tóc" items={hairBarbers} value={hairBarberId} onChange={(id) => changeBarber(setHairBarberId, id)} />}
            {!needsHair && needsCare && <div className="booking-auto-care"><b>Nhân viên chăm sóc tự động</b><span>Hệ thống sẽ chọn ngẫu nhiên một nhân viên phù hợp còn lịch trống.</span></div>}
          </section>}

          <section className="booking-panel">
            <div className="booking-panel-title"><b>03</b><div><h2>Chọn thời gian</h2><p>Khung giờ mờ đã có lịch; khung sáng còn có thể đặt.</p></div></div>
            <div className="booking-slots">{slotsLoading ? <p>Đang tải khung giờ...</p> : slots.map((slot) => <button type="button" key={slot.startTime} disabled={!slot.available} title={slot.reason} className={`${startTime === slot.startTime ? "selected" : ""} ${!slot.available ? "occupied" : ""}`} onClick={() => setStartTime(slot.startTime)}>{slot.startTime}<small>{slot.endTime}</small></button>)}</div>
            <label className="booking-note">Ghi chú<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yêu cầu kiểu tóc hoặc lưu ý khác..." /></label>
          </section>
          <section className="booking-panel">
            <div className="booking-panel-title"><b>04</b><div><h2>Thông tin khách sử dụng</h2><p>Có thể sửa để đặt lịch hộ người khác.</p></div></div>
            <div className="booking-fields"><label>Họ và tên<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label><label>Số điện thoại<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></label><label>Email<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></label></div>
          </section>
        </main>

        <aside className="booking-summary">
          <div className="booking-summary-header">
            <div><span>ĐƠN ĐẶT LỊCH</span><h2>Dịch vụ đã chọn</h2></div>
            <strong title="Tổng thời gian tất cả dịch vụ">{formatDuration(totalDuration)}</strong>
          </div>

          <div className="booking-summary-services">
            {!selectedServices.length ? (
              <p className="booking-summary-empty">Chưa chọn dịch vụ.</p>
            ) : (
              <ul>
                {selectedServices.map((service, index) => (
                  <li key={service.id}>
                    <span className="booking-summary-number">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <b>{service.name}</b>
                      <small>{formatDuration(service.durationMinutes)} · {money(service.price)}đ</small>
                    </div>
                    <button type="button" title={`Bỏ ${service.name}`} onClick={() => toggleService(service)}>✓</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="booking-summary-tools">
            <div className="booking-voucher-picker">
              <button type="button" className="booking-voucher-trigger" onClick={() => setVoucherOpen(true)}>
                <span>Voucher</span><b>{voucherCode || "Chọn mã"}</b><i>⌄</i>
              </button>
            </div>
          </div>

          {voucherMessage && <small className="booking-voucher-message">{voucherMessage}</small>}
          <div className="booking-totals">
            <p><span>Tạm tính</span><b>{money(subtotal)}đ</b></p>
            {voucherCalculation && <p><span>Voucher {voucherCalculation.code}</span><b>-{money(voucherCalculation.discountAmount)}đ</b></p>}
            <p className="grand-total"><span>Tổng thanh toán</span><b>{money(total)}đ</b></p>
            {depositRequired && <small>Đặt cọc 30% sau voucher: <b>{money(depositAmount)}đ</b></small>}
          </div>
          <div className="booking-summary-footer">
            <button className="booking-submit" disabled={submitting}>{submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}</button>
            <Link className="booking-history-link" to="/booking-history">Xem lịch đã đặt</Link>
          </div>
        </aside>
      </form>
      {depositAppointment && (
        <div className="booking-deposit-modal">
          <section>
            <h2>Thanh toán đặt cọc 30%</h2>
            <p>Mã lịch: <b>{depositAppointment.appointmentCode}</b></p>
            <strong>{money(depositAppointment.depositAmount)}đ</strong>
            <p>Bạn sẽ được chuyển sang cổng VNPay để chọn ngân hàng, quét QR hoặc thanh toán bằng phương thức được hỗ trợ.</p>
            <button type="button" disabled={submitting} onClick={() => void finishDeposit()}>{submitting ? "Đang tạo giao dịch..." : "Thanh toán cọc qua VNPay"}</button>
          </section>
        </div>
      )}
      {voucherOpen && (
        <div className="booking-voucher-modal" onMouseDown={() => setVoucherOpen(false)}>
          <section onMouseDown={(event) => event.stopPropagation()}>
            <button className="close" type="button" onClick={() => setVoucherOpen(false)}>×</button>
            <span>THADS BARBER</span>
            <h2>Chọn voucher</h2>
            <p>Voucher được áp dụng ngay vào tổng tiền tạm tính của lịch hẹn.</p>
            {voucherCode && <button type="button" className="voucher-option" onClick={() => { clearVoucher(); setVoucherOpen(false); }}><b>Không dùng voucher</b></button>}
            {availableVouchers.map((voucher) => (
              <button type="button" className={`voucher-option ${voucher.code === voucherCode ? "selected" : ""}`} key={voucher.code} onClick={() => chooseVoucher(voucher)}>
                <b>{voucher.code}</b>
                <strong>{voucher.type === "PERCENT" ? `Giảm ${voucher.value}%` : `Giảm ${money(voucher.value)}đ`}</strong>
                <small>{voucher.name}{voucher.maxDiscount ? ` · tối đa ${money(voucher.maxDiscount)}đ` : ""}</small>
                {voucher.description && <small>{voucher.description}</small>}
                <small>Áp dụng: {voucher.applicableServiceGroups.length ? voucher.applicableServiceGroups.map((group) => groupNames[group]).join(", ") : "Tất cả dịch vụ"}</small>
                <small>Giảm thực tế {money(voucher.discountAmount)}đ · còn {money(voucher.total)}đ · hết hạn {new Date(voucher.endDate).toLocaleDateString("vi-VN")}</small>
              </button>
            ))}
            {!availableVouchers.length && <p>Không có voucher phù hợp.</p>}
          </section>
        </div>
      )}
    </div></>
  );
}

function BarberPicker({ title, items, value, onChange }: { title: string; items: CatalogBarber[]; value: string; onChange: (id: string) => void }) {
  return <div className="booking-barber-picker"><h3>{title}</h3>{!items.length ? <p>Chưa có nhân viên phù hợp với toàn bộ dịch vụ đã chọn.</p> : <div>{items.map((barber) => <button type="button" key={barber.id} className={value === barber.id ? "selected" : ""} onClick={() => onChange(barber.id)}>{barber.profile.avatar ? <img src={barber.profile.avatar} alt={barber.fullName} /> : <span>{barber.fullName.charAt(0)}</span>}<b>{barber.fullName}</b><small>{barber.profile.experienceYears} năm kinh nghiệm</small></button>)}</div>}</div>;
}

export default Booking;
