import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAvailableSlots, rescheduleAppointment, getAppointment } from "../../services/appointment.service";
import type { AvailableSlot } from "../../services/appointment.service";
import { getCatalogBarbers, getCatalogServices } from "../../services/catalog.service";
import type { CatalogBarber, CatalogService } from "../../types/Catalog";
import ClientHeader from "../../components/ClientHeader";
import "./css/Booking.css";

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
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentBarberId, setCurrentBarberId] = useState<string>("");
  const [currentServiceIds, setCurrentServiceIds] = useState<string[]>([]);
  const [appointmentCode, setAppointmentCode] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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
      
      // Get barber ID
      const barberId = typeof appointment.barber === "object" && appointment.barber !== null
        ? (appointment.barber as BarberInfo)._id || ""
        : (appointment.barber as string) || "";
      setCurrentBarberId(barberId);
      
      // Get service IDs from appointment services
      const serviceIds = appointment.services
        .map((s: { service: { _id?: string } | string }) => {
          if (typeof s.service === "object" && s.service !== null) {
            return s.service._id || (s.service as unknown as string);
          }
          return s.service as string;
        })
        .filter(Boolean);
      setCurrentServiceIds(serviceIds);
      
      // Store appointment info for display
      setAppointmentCode(appointment.appointmentCode || appointmentId.slice(-8));
      setCurrentDate(appointment.appointmentDate);
      setCurrentTime(appointment.startTime);
      
      // Store services info for display
      const servicesList: ServiceInfo[] = appointment.services.map((s: { nameSnapshot?: string; durationSnapshot?: number; priceSnapshot?: number; service?: { name?: string; _id?: string } | string }) => ({
        _id: typeof s.service === "object" && s.service !== null ? s.service._id : undefined,
        name: s.nameSnapshot || (typeof s.service === "object" && s.service !== null ? s.service.name || "Dịch vụ" : "Dịch vụ"),
        duration: s.durationSnapshot || 0,
        price: s.priceSnapshot || 0,
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

  // Load slots when date changes
  useEffect(() => {
    setStartTime("");
    if (!appointmentDate) {
      setSlots([]);
      return;
    }
    if (!currentBarberId && currentServiceIds.length === 0) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    fetchBusinessQuery("reschedule-slots", () =>
      getAvailableSlots(currentBarberId || undefined, currentServiceIds, appointmentDate)
    )
      .then((response) => setSlots(response.slots))
      .catch((requestError) => {
        setSlots([]);
        setError(getError(requestError));
      })
      .finally(() => setSlotsLoading(false));
  }, [appointmentDate, currentBarberId, currentServiceIds]);

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
      <div className="booking-layout" style={{ maxWidth: 800, margin: "0 auto" }}>
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

              <div className="booking-current-appointment">
                <div className="booking-info-row">
                  <span>Mã lịch:</span>
                  <strong>{appointmentCode}</strong>
                </div>
                <div className="booking-info-row">
                  <span>Ngày giờ cũ:</span>
                  <strong style={{ color: "#d96969" }}>
                    {formatDate(currentDate)} lúc {currentTime}
                  </strong>
                </div>
                {servicesInfo.length > 0 && (
                  <div className="booking-info-services">
                    <span>Dịch vụ:</span>
                    <ul>
                      {servicesInfo.map((service, idx) => (
                        <li key={idx}>
                          <strong>{service.name}</strong>
                          <small>
                            {formatDuration(service.duration)} · {money(service.price)}đ
                          </small>
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

          <div className="booking-actions">
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
      </div>

      <style>{`
        .booking-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .booking-cancel-btn {
          flex: 0 0 auto;
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

        .booking-current-appointment {
          padding: 16px;
          background: #22211e;
          border: 1px solid #3b3934;
          border-radius: 8px;
        }

        .booking-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #333;
        }

        .booking-info-row:last-child {
          border-bottom: none;
        }

        .booking-info-row span {
          color: #aaa69e;
          font-size: 13px;
        }

        .booking-info-row strong {
          color: #f0ece3;
          font-size: 14px;
        }

        .booking-info-services {
          padding-top: 12px;
        }

        .booking-info-services span {
          display: block;
          color: #aaa69e;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .booking-info-services ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .booking-info-services li {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }

        .booking-info-services li strong {
          color: #f0ece3;
          font-size: 13px;
        }

        .booking-info-services li small {
          color: #d8bb80;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default Reschedule;
