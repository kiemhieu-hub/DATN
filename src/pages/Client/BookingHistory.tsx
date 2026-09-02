import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ReviewModal from "../../components/ReviewModal";
import { cancelAppointment, getMyAppointments } from "../../services/appointment.service";
import { getMyReviews } from "../../services/review.service";
import { createVnpayPayment, type VnpayPurpose } from "../../services/vnpay.service";
import type { Appointment, AppointmentStatus, PaymentStatus } from "../../types/Appointment";
import ClientHeader from "../../components/ClientHeader";
import "./css/BookingHistory.css";

interface LocationState {
  message?: string;
}

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Đang chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang xử lý",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount);

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  if (hours > 0) {
    return `${hours} giờ`;
  }

  return `${remainingMinutes} phút`;
};

const formatDate = (dateValue: string): string => {
  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateValue: string): string => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("vi-VN");
};

const getBarberName = (appointment: Appointment): string => {
  if (typeof appointment.barber === "string") {
    return "Barber";
  }

  return appointment.barber.fullName;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    return data?.message || fallback;
  }

  return fallback;
};

function BookingHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const locationState = location.state as LocationState | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(locationState?.message ?? "");

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [reviewedAppointmentIds, setReviewedAppointmentIds] = useState<Set<string>>(new Set());
  const [cancelReason, setCancelReason] = useState("");
  const [refundBankName, setRefundBankName] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundAccountName, setRefundAccountName] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [barberFilter, setBarberFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const [response, reviewResponse] = await Promise.all([
        fetchBusinessQuery("my-appointments", () => getMyAppointments()),
        fetchBusinessQuery("my-reviews", () => getMyReviews()),
      ]);

      setAppointments(response.appointments);
      setReviewedAppointmentIds(
        new Set(reviewResponse.reviews.map((review) => String(review.appointment)))
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải lịch sử đặt lịch."));
    } finally {
      setLoading(false);
    }
  }, []);

  useRealtimeRefresh(() => {
    void loadAppointments();
  }, isAuthenticated);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          message: "Bạn cần đăng nhập để xem lịch sử đặt lịch.",
        },
      });

      return;
    }

    void loadAppointments();
  }, [authLoading, isAuthenticated, navigate, loadAppointments]);

  const canCancel = (appointment: Appointment): boolean => {
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) return false;
    const startsAt = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
    const leadTime = startsAt.getTime() - Date.now();
    return appointment.status === "PENDING" ? leadTime > 0 : leadTime >= 24 * 60 * 60 * 1000;
  };

  const filteredAppointments = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return [...appointments]
      .filter((appointment) => {
        const barber = getBarberName(appointment).toLowerCase();
        const code = (appointment.appointmentCode || appointment._id).toLowerCase();
        const customer = appointment.customer?.fullName?.toLowerCase() || "";
        return (
          (!search || code.includes(search) || customer.includes(search)) &&
          (!dateFilter || appointment.appointmentDate === dateFilter) &&
          (!barberFilter || barber.includes(barberFilter.toLowerCase())) &&
          (statusFilter === "ALL" || appointment.status === statusFilter)
        );
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      );
  }, [appointments, keyword, dateFilter, barberFilter, statusFilter]);

  const handleCancel = async (appointment: Appointment): Promise<void> => {
    if (!cancelReason.trim()) {
      setError("Vui lòng nhập lý do hủy lịch.");
      return;
    }

    try {
      setCancellingId(appointment._id);
      setError("");
      setMessage("");

      const response = await cancelAppointment(appointment._id, {
        reason: cancelReason.trim(),
        refundBankName: refundBankName.trim() || undefined,
        refundAccountNumber: refundAccountNumber.trim() || undefined,
        refundAccountName: refundAccountName.trim() || undefined,
      });

      setMessage(response.message);
      setCancelTarget(null);
      setCancelReason("");

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment._id === response.appointment._id
            ? response.appointment
            : currentAppointment
        )
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể hủy lịch."));
    } finally {
      setCancellingId(null);
    }
  };

  const startVnpayPayment = async (
    appointment: Appointment,
    purpose: VnpayPurpose
  ): Promise<void> => {
    try {
      setPayingId(appointment._id);
      setError("");
      const result = await createVnpayPayment(appointment._id, purpose);
      window.location.assign(result.paymentUrl);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tạo giao dịch VNPay."));
      setPayingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="history-page">
        <div className="history-loading-card">
          <div className="history-spinner" />
          <p>Đang tải lịch sử đặt lịch...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientHeader />
      <div className="history-page">
        <main className="history-container">
          <header className="history-heading">
            <p className="history-brand">THADS Barber</p>
            <h1>Lịch sử đặt lịch</h1>
            <p>Theo dõi dịch vụ, Barber, trạng thái và thanh toán của từng lịch hẹn.</p>
          </header>

          <div className="history-actions">
            <Link to="/booking" className="history-primary-button">
              Đặt lịch mới
            </Link>
            <Link to="/" className="history-secondary-link">
              Quay về trang chủ
            </Link>
          </div>

          <section className="history-filters">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên khách hoặc mã lịch"
            />
            <input
              value={barberFilter}
              onChange={(event) => setBarberFilter(event.target.value)}
              placeholder="Tên Barber"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AppointmentStatus | "ALL")
              }
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>

          {message && <p className="history-message history-success">{message}</p>}

          {error && (
            <div className="history-message history-error">
              <span>{error}</span>
              <button type="button" onClick={() => void loadAppointments()}>
                Thử lại
              </button>
            </div>
          )}

          {appointments.length === 0 ? (
            <section className="history-empty">
              <h2>Bạn chưa có lịch hẹn</h2>
              <p>Hãy đặt lịch để sử dụng dịch vụ tại THADS Barber.</p>
              <Link to="/booking" className="history-primary-button">
                Đặt lịch ngay
              </Link>
            </section>
          ) : (
            <div className="history-list">
              {filteredAppointments.map((appointment) => (
                <article className="history-card" key={appointment._id}>
                  <div className="history-card-header">
                    <div>
                      <p className="history-code">
                        Mã lịch: {appointment.appointmentCode || appointment._id.slice(-8)}
                      </p>
                      <h2>{getBarberName(appointment)}</h2>
                    </div>

                    <div className="history-statuses">
                      <span
                        className={`history-status status-${appointment.status.toLowerCase()}`}
                      >
                        {appointmentStatusLabels[appointment.status]}
                      </span>

                      <span
                        className={`history-payment payment-${appointment.paymentStatus.toLowerCase()}`}
                      >
                        {paymentStatusLabels[appointment.paymentStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="history-time-banner">
                    <div>
                      <span>Ngày hẹn</span>
                      <strong>{formatDate(appointment.appointmentDate)}</strong>
                    </div>

                    <div>
                      <span>Giờ bắt đầu</span>
                      <strong>{appointment.startTime}</strong>
                    </div>

                    <div>
                      <span>Giờ kết thúc</span>
                      <strong>{appointment.endTime}</strong>
                    </div>

                    <div>
                      <span>Tổng thời gian</span>
                      <strong>{formatDuration(appointment.durationMinutes)}</strong>
                    </div>
                  </div>

                  <section className="history-services">
                    <div className="history-section-title">
                      <span>Dịch vụ đã chọn</span>
                      <small>{appointment.services.length} dịch vụ</small>
                    </div>

                    <ul>
                      {appointment.services.map((service, index) => (
                        <li key={`${service.nameSnapshot}-${index}`}>
                          <div>
                            <span className="history-service-number">{index + 1}</span>
                            <div>
                              <strong>{service.nameSnapshot}</strong>
                              <small>{formatDuration(service.durationSnapshot)}</small>
                            </div>
                          </div>

                          <span>{formatPrice(service.priceSnapshot)}đ</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="history-details">
                    <div>
                      <span>Khách sử dụng</span>
                      <strong>{appointment.customer?.fullName || "Chưa có"}</strong>
                      <small>{appointment.customer?.phone}</small>
                    </div>
                    <div>
                      <span>Barber</span>
                      <strong>{getBarberName(appointment)}</strong>
                    </div>
                    <div>
                      <span>Tổng tiền</span>
                      <strong className="history-total-price">
                        {formatPrice(appointment.totalPrice)}đ
                      </strong>
                    </div>
                    {appointment.voucherCode && (
                      <div className="history-voucher-card">
                        <span>Voucher đã chọn</span>
                        <strong>{appointment.voucherCode}</strong>
                        <small>
                          {appointment.voucherAppliedAt
                            ? `Đã áp dụng khi thanh toán: -${formatPrice(
                              appointment.finalDiscountAmount ?? appointment.discountAmount
                            )}đ`
                            : "Sẽ được tính trên hóa đơn thực tế khi hoàn thành dịch vụ"}
                        </small>
                      </div>
                    )}
                    <div>
                      <span>Đặt cọc</span>
                      <strong>
                        {appointment.depositRequired
                          ? `${formatPrice(appointment.depositAmount)}đ · ${appointment.depositPaid ? "Đã cọc" : "Chưa cọc"
                          }`
                          : "Không yêu cầu"}
                      </strong>
                    </div>

                    <div>
                      <span>Trạng thái lịch</span>
                      <strong>{appointmentStatusLabels[appointment.status]}</strong>
                    </div>

                    <div>
                      <span>Thanh toán</span>
                      <strong>{paymentStatusLabels[appointment.paymentStatus]}</strong>
                    </div>
                  </div>

                  {appointment.note && (
                    <div className="history-note">
                      <span>Ghi chú</span>
                      <p>{appointment.note}</p>
                    </div>
                  )}

                  {appointment.status === "CANCELLED" && appointment.cancellation && (
                    <div className="history-cancel-reason">
                      <span>Lý do hủy</span>
                      <p>{appointment.cancellation.reason}</p>
                      {appointment.cancellation.cancelledAt && (
                        <small>
                          Hủy lúc: {formatDateTime(appointment.cancellation.cancelledAt)}
                        </small>
                      )}
                    </div>
                  )}

                  <footer className="history-card-footer">
                    <small>Tạo lúc: {formatDateTime(appointment.createdAt)}</small>

                    {canCancel(appointment) && (
                      <button
                        type="button"
                        className="history-cancel-button"
                        disabled={cancellingId === appointment._id}
                        onClick={() => {
                          setCancelTarget(appointment);
                          setCancelReason("");
                        }}
                      >
                        {cancellingId === appointment._id ? "Đang hủy..." : "Hủy lịch"}
                      </button>
                    )}
                    {appointment.depositRequired &&
                      !appointment.depositPaid &&
                      !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status) && (
                        <button
                          type="button"
                          className="history-payment-button"
                          disabled={payingId === appointment._id}
                          onClick={() => void startVnpayPayment(appointment, "DEPOSIT")}
                        >
                          {payingId === appointment._id
                            ? "Đang chuyển hướng..."
                            : `Thanh toán cọc ${formatPrice(appointment.depositAmount)}đ`}
                        </button>
                      )}
                    {appointment.status === "COMPLETED" &&
                      appointment.paymentStatus !== "PAID" && (
                        <button
                          type="button"
                          className="history-payment-button"
                          disabled={payingId === appointment._id}
                          onClick={() => void startVnpayPayment(appointment, "BALANCE")}
                        >
                          {payingId === appointment._id
                            ? "Đang chuyển hướng..."
                            : "Thanh toán qua VNPay"}
                        </button>
                      )}
                    {appointment.status === "COMPLETED" &&
                      (reviewedAppointmentIds.has(appointment._id) ? (
                        <span className="history-reviewed-label">✓ Đã gửi đánh giá</span>
                      ) : (
                        <button
                          type="button"
                          className="history-review-button"
                          onClick={() => setReviewTarget(appointment)}
                        >
                          Đánh giá dịch vụ
                        </button>
                      ))}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </main>
        {cancelTarget && (
          <div
            className="history-cancel-modal-bg"
            onMouseDown={() => setCancelTarget(null)}
          >
            <form
              className="history-cancel-modal"
              style={{
                background: "#1f1c19",
                border: "1px solid #66513b",
                color: "#ffffff"
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                void handleCancel(cancelTarget);
              }}
            >
              <h2 style={{ margin: "0 0 14px 0", fontSize: "26px" }}>
                <span style={{ color: "#ffffff !important" as any, WebkitTextFillColor: "#ffffff" }}>
                  Yêu cầu hủy lịch
                </span>
              </h2>

              <p style={{ margin: "6px 0", fontSize: "14px" }}>
                <span style={{ color: "#e0dcd5", WebkitTextFillColor: "#e0dcd5" }}>Mã lịch: </span>
                <b style={{ color: "#d2aa5c", WebkitTextFillColor: "#d2aa5c" }}>
                  {cancelTarget.appointmentCode || cancelTarget._id}
                </b>
              </p>

              <p style={{ margin: "6px 0 16px 0", fontSize: "14px" }}>
                <span style={{ color: "#e0dcd5", WebkitTextFillColor: "#e0dcd5" }}>
                  {formatDate(cancelTarget.appointmentDate)} · {cancelTarget.startTime}–{cancelTarget.endTime}
                </span>
              </p>

              <label
                style={{
                  display: "grid",
                  gap: "8px",
                  margin: "16px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>Lý do hủy</span>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  required
                  placeholder="Mô tả lý do bạn cần hủy lịch..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#121110",
                    border: "1px solid #514a43",
                    color: "#ffffff",
                    WebkitTextFillColor: "#ffffff",
                    padding: "12px",
                    minHeight: "110px",
                    outline: "none",
                  }}
                />
              </label>

              {cancelTarget.depositPaid && (
                <fieldset
                  style={{
                    margin: "16px 0",
                    border: "1px solid #514a43",
                    padding: "14px",
                  }}
                >
                  <legend style={{ padding: "0 8px", color: "#d8b272", fontWeight: 600 }}>
                    Tài khoản nhận hoàn cọc
                  </legend>
                  <label style={{ display: "grid", gap: "6px", margin: "8px 0", color: "#ddd" }}>
                    <span>Ngân hàng</span>
                    <input
                      value={refundBankName}
                      onChange={(event) => setRefundBankName(event.target.value)}
                      style={{
                        width: "100%",
                        background: "#121110",
                        border: "1px solid #514a43",
                        color: "#ffffff",
                        WebkitTextFillColor: "#ffffff",
                        padding: "10px",
                      }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", margin: "8px 0", color: "#ddd" }}>
                    <span>Số tài khoản</span>
                    <input
                      value={refundAccountNumber}
                      onChange={(event) => setRefundAccountNumber(event.target.value)}
                      style={{
                        width: "100%",
                        background: "#121110",
                        border: "1px solid #514a43",
                        color: "#ffffff",
                        WebkitTextFillColor: "#ffffff",
                        padding: "10px",
                      }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", margin: "8px 0", color: "#ddd" }}>
                    <span>Chủ tài khoản</span>
                    <input
                      value={refundAccountName}
                      onChange={(event) => setRefundAccountName(event.target.value)}
                      style={{
                        width: "100%",
                        background: "#121110",
                        border: "1px solid #514a43",
                        color: "#ffffff",
                        WebkitTextFillColor: "#ffffff",
                        padding: "10px",
                      }}
                    />
                  </label>
                </fieldset>
              )}

              <small
                style={{
                  display: "block",
                  color: "#d8b272",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  margin: "14px 0",
                }}
              >
                Lịch chưa xác nhận được hủy trước giờ hẹn. Lịch đã xác nhận phải hủy trước 24 giờ; hoàn cọc nếu hủy trước ít nhất 3 ngày.
              </small>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  style={{
                    padding: "10px 18px",
                    background: "#292622",
                    color: "#ffffff",
                    border: "1px solid #555",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={cancellingId === cancelTarget._id}
                  style={{
                    padding: "10px 18px",
                    background: "#b84e4e",
                    color: "#ffffff",
                    border: "1px solid #b84e4e",
                    cursor: "pointer",
                    borderRadius: "6px",
                    fontWeight: 700,
                  }}
                >
                  {cancellingId === cancelTarget._id ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </form>
          </div>
        )}

        {reviewTarget && (
          <ReviewModal
            appointment={reviewTarget}
            onClose={() => setReviewTarget(null)}
            onError={(reviewError) => setError(reviewError)}
            onSuccess={(appointmentId, successMessage) => {
              setReviewedAppointmentIds((current) => new Set(current).add(appointmentId));
              setMessage(successMessage);
              setError("");
              setReviewTarget(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default BookingHistory;