import axios from "axios";
import {useCallback,useEffect,useState,} from "react";
import {Link,useLocation,useNavigate,} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ReviewModal from "../../components/ReviewModal";
import {cancelAppointment,getMyAppointments,} from "../../services/appointment.service";
import { getMyReviews } from "../../services/review.service";
import { createVnpayPayment, type VnpayPurpose } from "../../services/vnpay.service";
import type {Appointment,AppointmentStatus,PaymentStatus,} from "../../types/Appointment";
import "./css/BookingHistory.css";

interface LocationState {
  message?: string;
}

const appointmentStatusLabels: Record<AppointmentStatus,string> = {
  PENDING: "Đang chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<PaymentStatus,string> = {
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
  if (
    typeof appointment.barber ==="string"
  ) {
    return "Barber";
  }

  return appointment.barber.fullName;
};

const getErrorMessage = (error: unknown,fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as | {message?: string;} | undefined;

    return data?.message || fallback;
  }

  return fallback;
};

function BookingHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const locationState =
    location.state as LocationState | null;

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState(
      locationState?.message ?? ""
    );

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [reviewedAppointmentIds, setReviewedAppointmentIds] = useState<Set<string>>(new Set());
  const [cancelReason, setCancelReason] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const loadAppointments =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const [response, reviewResponse] = await Promise.all([
          getMyAppointments(),
          getMyReviews(),
        ]);

        setAppointments(
          response.appointments
        );
        setReviewedAppointmentIds(
          new Set(reviewResponse.reviews.map((review) => String(review.appointment)))
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải lịch sử đặt lịch."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Bạn cần đăng nhập để xem lịch sử đặt lịch.",
        },
      });

      return;
    }

    void loadAppointments();
  }, [
    authLoading,
    isAuthenticated,
    navigate,
    loadAppointments,
  ]);

  const canCancel = (
    appointment: Appointment
  ): boolean => {
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) return false;
    const startsAt = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
    return startsAt.getTime() - Date.now() >= 6 * 60 * 60 * 1000;
  };

  const handleCancel = async (
    appointment: Appointment
  ): Promise<void> => {
    if (!cancelReason.trim()) { setError("Vui lòng nhập lý do hủy lịch."); return; }

    try {
      setCancellingId(appointment._id);
      setError("");
      setMessage("");

      const response =
        await cancelAppointment(
          appointment._id,
          {
              reason: cancelReason.trim(),
          }
        );

      setMessage(response.message);
      setCancelTarget(null);
      setCancelReason("");

      setAppointments(
        (currentAppointments) => currentAppointments.map((currentAppointment) => currentAppointment._id === response.appointment._id ? response.appointment : currentAppointment
          )
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể hủy lịch."
        )
      );
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

          <p>
            Đang tải lịch sử đặt lịch...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <main className="history-container">
        <header className="history-heading">
          <p className="history-brand">
            THADS Barber
          </p>

          <h1>Lịch sử đặt lịch</h1>

          <p>
            Theo dõi dịch vụ, Barber, trạng thái
            và thanh toán của từng lịch hẹn.
          </p>
        </header>

        <div className="history-actions">
          <Link
            to="/booking"
            className="history-primary-button"
          >
            Đặt lịch mới
          </Link>

          <Link
            to="/"
            className="history-secondary-link"
          >
            Quay về trang chủ
          </Link>
        </div>

        {message && (
          <p className="history-message history-success">
            {message}
          </p>
        )}

        {error && (
          <div className="history-message history-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                void loadAppointments()
              }
            >
              Thử lại
            </button>
          </div>
        )}

        {appointments.length === 0 ? (
          <section className="history-empty">
            <h2>Bạn chưa có lịch hẹn</h2>

            <p>
              Hãy đặt lịch để sử dụng dịch vụ tại
              THADS Barber.
            </p>

            <Link
              to="/booking"
              className="history-primary-button"
            >
              Đặt lịch ngay
            </Link>
          </section>
        ) : (
          <div className="history-list">
            {appointments.map(
              (appointment) => (
                <article
                  className="history-card"
                  key={appointment._id}
                >
                  <div className="history-card-header">
                    <div>
                      <p className="history-code">
                        Mã lịch:{" "}
                        {appointment.appointmentCode || appointment._id.slice(-8)}
                      </p>

                      <h2>
                        {getBarberName(
                          appointment
                        )}
                      </h2>
                    </div>

                    <div className="history-statuses">
                      <span
                        className={`history-status status-${appointment.status.toLowerCase()}`}
                      >
                        {
                          appointmentStatusLabels[
                            appointment.status
                          ]
                        }
                      </span>

                      <span
                        className={`history-payment payment-${appointment.paymentStatus.toLowerCase()}`}
                      >
                        {
                          paymentStatusLabels[
                            appointment.paymentStatus
                          ]
                        }
                      </span>
                    </div>
                  </div>

                  <div className="history-time-banner">
                    <div>
                      <span>Ngày hẹn</span>

                      <strong>
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Giờ bắt đầu</span>

                      <strong>
                        {appointment.startTime}
                      </strong>
                    </div>

                    <div>
                      <span>Giờ kết thúc</span>

                      <strong>
                        {appointment.endTime}
                      </strong>
                    </div>

                    <div>
                      <span>Tổng thời gian</span>

                      <strong>
                        {formatDuration(
                          appointment.durationMinutes
                        )}
                      </strong>
                    </div>
                  </div>

                  <section className="history-services">
                    <div className="history-section-title">
                      <span>Dịch vụ đã chọn</span>

                      <small>
                        {
                          appointment.services
                            .length
                        }{" "}
                        dịch vụ
                      </small>
                    </div>

                    <ul>
                      {appointment.services.map(
                        (service, index) => (
                          <li
                            key={`${service.nameSnapshot}-${index}`}
                          >
                            <div>
                              <span className="history-service-number">
                                {index + 1}
                              </span>

                              <div>
                                <strong>
                                  {
                                    service.nameSnapshot
                                  }
                                </strong>

                                <small>
                                  {formatDuration(
                                    service.durationSnapshot
                                  )}
                                </small>
                              </div>
                            </div>

                            <span>
                              {formatPrice(
                                service.priceSnapshot
                              )}
                              đ
                            </span>
                          </li>
                        )
                      )}
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

                      <strong>
                        {getBarberName(
                          appointment
                        )}
                      </strong>
                    </div>
                    {appointment.staffAssignments?.map((assignment) => (
                      <div key={`${assignment.staffType}-${assignment.startTime}`}>
                        <span>{assignment.staffType === "HAIR" ? "Time 1 · Làm tóc" : "Time 2 · Chăm sóc"}</span>
                        <strong>
                          {typeof assignment.barber === "string"
                            ? "Nhân viên THADS"
                            : assignment.barber.fullName}
                        </strong>
                        <small>{assignment.startTime} – {assignment.endTime}</small>
                      </div>
                    ))}

                    <div>
                      <span>Tổng tiền</span>

                      <strong className="history-total-price">
                        {formatPrice(
                          appointment.totalPrice
                        )}
                        đ
                      </strong>
                    </div>
                    {appointment.discountPercent > 0 && <div><span>Voucher</span><strong>{appointment.voucherCode} (-{appointment.discountPercent}%)</strong></div>}
                    <div><span>Đặt cọc</span><strong>{appointment.depositRequired ? `${formatPrice(appointment.depositAmount)}đ` : "Không yêu cầu"}</strong></div>

                    <div>
                      <span>Trạng thái lịch</span>

                      <strong>
                        {
                          appointmentStatusLabels[
                            appointment.status
                          ]
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Thanh toán</span>

                      <strong>
                        {
                          paymentStatusLabels[
                            appointment.paymentStatus
                          ]
                        }
                      </strong>
                    </div>
                  </div>

                  {appointment.note && (
                    <div className="history-note">
                      <span>Ghi chú</span>

                      <p>
                        {appointment.note}
                      </p>
                    </div>
                  )}

                  {appointment.status ===
                    "CANCELLED" &&
                    appointment.cancellation && (
                      <div className="history-cancel-reason">
                        <span>Lý do hủy</span>

                        <p>
                          {
                            appointment
                              .cancellation
                              .reason
                          }
                        </p>

                        {appointment
                          .cancellation
                          .cancelledAt && (
                          <small>
                            Hủy lúc:{" "}
                            {formatDateTime(
                              appointment
                                .cancellation
                                .cancelledAt
                            )}
                          </small>
                        )}
                      </div>
                    )}

                  <footer className="history-card-footer">
                    <small>
                      Tạo lúc:{" "}
                      {formatDateTime(
                        appointment.createdAt
                      )}
                    </small>

                    {canCancel(
                      appointment
                    ) && (
                      <button
                        type="button"
                        className="history-cancel-button"
                        disabled={
                          cancellingId ===
                          appointment._id
                        }
                        onClick={() => { setCancelTarget(appointment); setCancelReason(""); }}
                      >
                        {cancellingId ===
                        appointment._id
                          ? "Đang hủy..."
                          : "Hủy lịch"}
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
                    {appointment.status === "COMPLETED" && (
                      reviewedAppointmentIds.has(appointment._id) ? (
                        <span className="history-reviewed-label">✓ Đã gửi đánh giá</span>
                      ) : (
                        <button
                          type="button"
                          className="history-review-button"
                          onClick={() => setReviewTarget(appointment)}
                        >
                          Đánh giá dịch vụ
                        </button>
                      )
                    )}
                  </footer>
                </article>
              )
            )}
          </div>
        )}
      </main>
      {cancelTarget && <div className="history-cancel-modal-bg" onMouseDown={() => setCancelTarget(null)}><form className="history-cancel-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void handleCancel(cancelTarget); }}><h2>Yêu cầu hủy lịch</h2><p>Mã lịch: <b>{cancelTarget.appointmentCode}</b></p><p>{formatDate(cancelTarget.appointmentDate)} · {cancelTarget.startTime}–{cancelTarget.endTime}</p><label>Lý do hủy<textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} required placeholder="Mô tả lý do bạn cần hủy lịch..." /></label><small>Chỉ có thể hủy trước giờ hẹn ít nhất 6 tiếng.</small><div><button type="button" onClick={() => setCancelTarget(null)}>Đóng</button><button type="submit" disabled={cancellingId === cancelTarget._id}>Xác nhận hủy</button></div></form></div>}
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
  );
}

export default BookingHistory;
