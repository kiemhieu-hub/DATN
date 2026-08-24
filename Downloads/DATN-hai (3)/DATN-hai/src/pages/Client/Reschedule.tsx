import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAvailableSlots, rescheduleAppointment, getAppointment } from "../../services/appointment.service";
import type { AvailableSlot } from "../../services/appointment.service";
import { getCatalogBarbers, getCatalogServices } from "../../services/catalog.service";
import type { CatalogBarber, CatalogService, ServiceGroup, ServiceStaffType } from "../../types/Catalog";
import ClientHeader from "../../components/ClientHeader";
import "./css/Booking.css";
import "./css/BookingDeposit.css";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const dateValue = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const getError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || "Có lỗi xảy ra";
  }
  return "Có lỗi xảy ra";
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}p`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h${remainingMinutes}p` : `${hours}h`;
};

interface ServiceInfo {
  _id?: string;
  name: string;
  duration: number;
  price: number;
  staffType?: string;
}

interface BarberInfo {
  _id?: string;
  fullName: string;
}

function Reschedule() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth("CLIENT");

  const [services, setServices] = useState<CatalogService[]>([]);
  const [barbers, setBarbers] = useState<CatalogBarber[]>([]);
  const [hairServiceIds, setHairServiceIds] = useState<string[]>([]);
  const [careServiceIds, setCareServiceIds] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentBarberId, setCurrentBarberId] = useState<string>("");
  const [appointmentCode, setAppointmentCode] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentEndTime, setCurrentEndTime] = useState("");
  const [servicesInfo, setServicesInfo] = useState<ServiceInfo[]>([]);

  const today = useMemo(() => dateValue(new Date()), []);
  const maxDate = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 14);
    return dateValue(value);
  }, []);

  const loadCatalog = useCallback(() => {
    Promise.all([
      fetchBusinessQuery("catalog-services", () => getCatalogServices()),
      fetchBusinessQuery("catalog-barbers", () => getCatalogBarbers()),
    ])
      .then(([serviceResponse, barberResponse]) => {
        setServices(serviceResponse.services);
        setBarbers(barberResponse.barbers);
      })
      .catch((requestError) => setError(getError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const loadAppointment = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const response = await getAppointment(appointmentId);
      const appointment = response.appointment;
      
      const barberId = typeof appointment.barber === "object" && appointment.barber !== null
        ? (appointment.barber as BarberInfo)._id || ""
        : (appointment.barber as string) || "";
      setCurrentBarberId(barberId);
      
      const serviceIds = appointment.services
        .map((s: { service: { _id?: string; staffType?: string } | string }) => {
          const id = typeof s.service === "object" && s.service !== null ? s.service._id : s.service;
          const staffType = typeof s.service === "object" && s.service !== null ? s.service.staffType : undefined;
          return { id, staffType };
        })
        .filter((s) => s.id);

      const hairIds = serviceIds.filter(s => s.staffType === "HAIR" || !s.staffType).map(s => s.id as string);
      const careIds = serviceIds.filter(s => s.staffType === "CARE").map(s => s.id as string);
      setHairServiceIds(hairIds);
      setCareServiceIds(careIds);
      
      setAppointmentCode(appointment.appointmentCode || appointmentId.slice(-8));
      setCurrentDate(appointment.appointmentDate);
      setCurrentTime(appointment.startTime);
      setCurrentEndTime(appointment.endTime || "");
      
      const servicesList: ServiceInfo[] = appointment.services.map((s: { nameSnapshot?: string; durationSnapshot?: number; priceSnapshot?: number; service?: { name?: string; _id?: string; staffType?: string } | string }) => ({
        _id: typeof s.service === "object" && s.service !== null ? s.service._id : undefined,
        name: s.nameSnapshot || "Dịch vụ",
        duration: s.durationSnapshot || 0,
        price: s.priceSnapshot || 0,
        staffType: typeof s.service === "object" && s.service !== null ? s.service.staffType : undefined,
      }));
      setServicesInfo(servicesList);
    } catch (requestError) {
      setError(getError(requestError));
    }
  }, [appointmentId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
    loadCatalog();
    void loadAppointment();
  }, [authLoading, isAuthenticated, user, navigate, loadCatalog, loadAppointment]);

  const serviceIds = useMemo(() => [...hairServiceIds, ...careServiceIds], [hairServiceIds, careServiceIds]);

  const selectedServices = useMemo(
    () =>
      serviceIds
        .map((id) => services.find((service) => service.id === id))
        .filter((service): service is CatalogService => Boolean(service)),
    [services, serviceIds]
  );

  const needsHair = hairServiceIds.length > 0;
  const needsCare = careServiceIds.length > 0;

  const hairBarbers = barbers.filter((barber) => {
    const required = selectedServices.filter((service) => service.staffType === "HAIR");
    const specialtyIds = new Set(barber.profile.specialties.map((item) => item._id));
    return barber.profile.staffType === "HAIR" && required.every((service) => specialtyIds.has(service.id));
  });

  useEffect(() => {
    setStartTime("");
    if (
      (needsHair && !currentBarberId) ||
      !appointmentDate ||
      serviceIds.length === 0
    ) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetchBusinessQuery("reschedule-slots", () =>
      getAvailableSlots(currentBarberId || undefined, serviceIds, appointmentDate)
    )
      .then((response) => setSlots(response.slots))
      .catch((requestError) => {
        setSlots([]);
        setError(getError(requestError));
      })
      .finally(() => setSlotsLoading(false));
  }, [appointmentDate, currentBarberId, serviceIds]);

  const hairDuration = selectedServices
    .filter((service) => service.staffType === "HAIR")
    .reduce((sum, service) => sum + service.durationMinutes, 0);
  const careDuration = selectedServices
    .filter((service) => service.staffType === "CARE")
    .reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalDuration = hairDuration + careDuration;

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const handleReschedule = async () => {
    if (!appointmentId) {
      setError("Không tìm thấy thông tin lịch hẹn");
      return;
    }

    if (!appointmentDate || !startTime) {
      setError("Vui lòng chọn ngày và khung giờ mới");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await rescheduleAppointment(appointmentId, {
        appointmentDate,
        startTime,
      });

      setSuccess("Đổi lịch thành công!");
      setTimeout(() => {
        navigate("/booking-history", {
          replace: true,
          state: { message: "Đổi lịch hẹn thành công. Email thông báo đang được gửi đến khách hàng." },
        });
      }, 1500);
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const hairServiceGroups = ["HAIRCUT", "BEARD", "COLOR", "OTHER"] as ServiceGroup[];
  const careServiceGroups = ["CARE"] as ServiceGroup[];

  if (authLoading || loading) {
    return (
      <div className="booking-page">
        <ClientHeader />
        <p className="booking-loading">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="booking-page">
        <ClientHeader />
        <div className="booking-login-required">
          <h1>Bạn chưa đăng nhập</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <ClientHeader />
      <div className="booking-layout" style={{ maxWidth: 1200 }}>
        <main className="booking-main">
          <header className="booking-header">
            <span>THADS BARBER</span>
            <h1>Đổi thời gian lịch hẹn</h1>
            <p>Chọn ngày và khung giờ mới cho lịch hẹn của bạn.</p>
          </header>

          {error && <div className="booking-alert">{error}</div>}
          {success && (
            <div className="booking-alert" style={{ background: "#1a3d1a", borderColor: "#4a8b4a", color: "#a8d9a8" }}>
              {success}
            </div>
          )}

          {appointmentCode && (
            <section className="booking-panel">
              <div className="booking-panel-title">
                <b>01</b>
                <div>
                  <h2>Lịch hẹn hiện tại</h2>
                  <p>Thông tin lịch hẹn cần đổi</p>
                </div>
              </div>

              <div className="reschedule-current-appointment">
                <div className="reschedule-info-row">
                  <span>Mã lịch:</span>
                  <strong>{appointmentCode}</strong>
                </div>
                <div className="reschedule-info-row">
                  <span>Ngày giờ cũ:</span>
                  <strong style={{ color: "#d96969" }}>
                    {formatDate(currentDate)} lúc {currentTime} - {currentEndTime}
                  </strong>
                </div>
                <div className="reschedule-time-summary">
                  {hairDuration > 0 && <div className="booking-time-item"><span>Cắt tóc</span><strong>{formatDuration(hairDuration)}</strong></div>}
                  {careDuration > 0 && <div className="booking-time-item"><span>Chăm sóc</span><strong>{formatDuration(careDuration)}</strong></div>}
                  <div className="booking-time-item booking-time-total"><span>Tổng thời gian</span><strong>{formatDuration(totalDuration)}</strong></div>
                </div>
                {servicesInfo.length > 0 && (
                  <div className="reschedule-services">
                    <span>Dịch vụ:</span>
                    <ul>
                      {servicesInfo.map((service, idx) => (
                        <li key={idx}>
                          <span className={`booking-service-type-badge ${service.staffType === "CARE" ? "care" : "hair"}`}>
                            {service.staffType === "CARE" ? "Chăm sóc" : "Cắt"}
                          </span>
                          <div>
                            <strong>{service.name}</strong>
                            <small>{formatDuration(service.duration)} · {money(service.price)}đ</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="booking-panel">
            <div className="booking-panel-title">
              <b>02</b>
              <div>
                <h2>Chọn ngày mới</h2>
                <p>Chọn ngày bạn muốn đổi sang</p>
              </div>
            </div>
            <label className="booking-date">
              Ngày hẹn mới
              <input
                type="date"
                min={today}
                max={maxDate}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setStartTime("");
                }}
              />
            </label>
            {needsHair && (
              <div className="booking-barber-picker" style={{ marginTop: 18 }}>
                <h3>Nhân viên làm tóc</h3>
                <div>
                  {hairBarbers.map((barber) => (
                    <button
                      type="button"
                      key={barber.id}
                      className={currentBarberId === barber.id ? "selected" : ""}
                      onClick={() => setCurrentBarberId(barber.id)}
                    >
                      {barber.profile.avatar ? (
                        <img src={barber.profile.avatar} alt={barber.fullName} />
                      ) : (
                        <span>{barber.fullName.charAt(0)}</span>
                      )}
                      <b>{barber.fullName}</b>
                      <small>{barber.profile.experienceYears} năm kinh nghiệm</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="booking-panel">
            <div className="booking-panel-title">
              <b>03</b>
              <div>
                <h2>Chọn khung giờ mới</h2>
                <p>Khung giờ sáng còn trống có thể đặt. Khung giờ mờ đã có lịch.</p>
              </div>
            </div>
            <div className="booking-slots">
              {slotsLoading ? (
                <p>Đang tải khung giờ...</p>
              ) : slots.length === 0 ? (
                <p>Không có khung giờ trống trong ngày này.</p>
              ) : (
                slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.startTime}
                    disabled={!slot.available}
                    title={slot.reason}
                    className={`${startTime === slot.startTime ? "selected" : ""} ${
                      !slot.available ? "occupied" : ""
                    }`}
                    onClick={() => setStartTime(slot.startTime)}
                  >
                    {slot.startTime}
                    <small>{slot.endTime}</small>
                  </button>
                ))
              )}
            </div>
          </section>

          <div className="reschedule-actions">
            <button
              type="button"
              className="booking-submit"
              disabled={submitting || !appointmentDate || !startTime}
              onClick={() => void handleReschedule()}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận đổi lịch"}
            </button>
            <button
              type="button"
              className="booking-cancel-btn"
              onClick={() => navigate("/booking-history")}
            >
              Hủy bỏ
            </button>
          </div>
        </main>

        <aside className="booking-summary">
          <div className="booking-summary-header">
            <div><span>LỊCH HẸN</span><h2>Thông tin đổi lịch</h2></div>
          </div>

          <div className="booking-time-summary">
            {hairDuration > 0 && <div className="booking-time-item"><span>Cắt tóc</span><strong>{formatDuration(hairDuration)}</strong></div>}
            {careDuration > 0 && <div className="booking-time-item"><span>Chăm sóc</span><strong>{formatDuration(careDuration)}</strong></div>}
            <div className="booking-time-item booking-time-total"><span>Tổng thời gian</span><strong>{formatDuration(totalDuration)}</strong></div>
          </div>

          <div className="booking-summary-services">
            <ul>
              {selectedServices.map((service) => (
                <li key={service.id}>
                  <span className={`booking-service-type-badge ${service.staffType === "HAIR" ? "hair" : "care"}`}>
                    {service.staffType === "HAIR" ? "Cắt" : "Chăm sóc"}
                  </span>
                  <div>
                    <b>{service.name}</b>
                    <small>{formatDuration(service.durationMinutes)} · {money(service.price)}đ</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="booking-totals">
            <p className="grand-total">
              <span>Tổng tiền</span>
              <b>{money(totalPrice)}đ</b>
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .reschedule-current-appointment {
          padding: 16px;
          background: #22211e;
          border: 1px solid #3b3934;
          border-radius: 8px;
        }

        .reschedule-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #333;
        }

        .reschedule-info-row:last-child {
          border-bottom: none;
        }

        .reschedule-info-row span {
          color: #aaa69e;
          font-size: 13px;
        }

        .reschedule-info-row strong {
          color: #f0ece3;
          font-size: 14px;
        }

        .reschedule-time-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 12px;
        }

        .reschedule-services {
          padding-top: 12px;
        }

        .reschedule-services span {
          display: block;
          color: #aaa69e;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .reschedule-services ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .reschedule-services li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
        }

        .reschedule-services li strong {
          color: #f0ece3;
          font-size: 13px;
        }

        .reschedule-services li small {
          color: #d8bb80;
          font-size: 12px;
        }

        .reschedule-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .reschedule-actions .booking-submit {
          flex: 1;
        }

        .booking-cancel-btn {
          padding: 13px 24px;
          color: #eee;
          font: inherit;
          font-weight: 600;
          background: #333;
          border: 1px solid #555;
          cursor: pointer;
        }

        .booking-cancel-btn:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}

export default Reschedule;
