import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import {useCallback,useEffect,useMemo,useState,} from "react";
import {Link,useLocation,useNavigate,} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ReviewModal from "../../components/ReviewModal";
import {
  cancelAppointment,
  getAvailableSlots,
  getMyAppointments,
  rescheduleAppointment,
  type AvailableSlot,
} from "../../services/appointment.service";
import { getMyReviews } from "../../services/review.service";
import { createVnpayPayment, type VnpayPurpose } from "../../services/vnpay.service";
import type {Appointment,AppointmentStatus,PaymentStatus,} from "../../types/Appointment";
import ClientHeader from "../../components/ClientHeader";
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
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailableSlot[]>([]);
  const [rescheduling, setRescheduling] = useState(false);
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
          fetchBusinessQuery("my-appointments", () => getMyAppointments()),
          fetchBusinessQuery("my-reviews", () => getMyReviews()),
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
    const leadTime = startsAt.getTime() - Date.now();
    return leadTime > 0;
  };

  const canReschedule = (appointment: Appointment): boolean =>
    ["PENDING", "CONFIRMED"].includes(appointment.status) &&
    new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`).getTime() > Date.now();

  const serviceIdsOf = (appointment: Appointment): string[] =>
    appointment.services.map((item) =>
      typeof item.service === "string" ? item.service : item.service._id
    );

  const hairBarberIdOf = (appointment: Appointment): string | undefined => {
    const hairAssignment = appointment.staffAssignments?.find((item) => item.staffType === "HAIR");
    if (hairAssignment) {
      return typeof hairAssignment.barber === "string" ? hairAssignment.barber : hairAssignment.barber._id;
    }
    return undefined;
  };

  useEffect(() => {
    if (!rescheduleTarget || !rescheduleDate) {
      setRescheduleSlots([]);
      return;
    }
    setRescheduleTime("");
    void getAvailableSlots(
      hairBarberIdOf(rescheduleTarget),
      serviceIdsOf(rescheduleTarget),
      rescheduleDate
    )
      .then((response) => setRescheduleSlots(response.slots.filter((slot) => slot.available)))
      .catch((requestError) => setError(getErrorMessage(requestError, "Không thể tải giờ Barber rảnh.")));
  }, [rescheduleDate, rescheduleTarget]);

  const handleReschedule = async (): Promise<void> => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      setError("Vui lòng chọn ngày và giờ Barber rảnh.");
      return;
    }
    try {
      setRescheduling(true);
      setError("");
      const response = await rescheduleAppointment(rescheduleTarget._id, {
        appointmentDate: rescheduleDate,
        startTime: rescheduleTime,
      });
      setAppointments((current) => current.map((item) =>
        item._id === response.appointment._id ? response.appointment : item
      ));
      setMessage(response.message);
      setRescheduleTarget(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể đổi thời gian lịch hẹn."));
    } finally {
      setRescheduling(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return [...appointments]
      .filter((appointment) => {
        const barber = getBarberName(appointment).toLowerCase();
        const code = (appointment.appointmentCode || appointment._id).toLowerCase();
        const customer = appointment.customer?.fullName?.toLowerCase() || "";
        return (!search || code.includes(search) || customer.includes(search))
          && (!dateFilter || appointment.appointmentDate === dateFilter)
          && (!barberFilter || barber.includes(barberFilter.toLowerCase()))
          && (statusFilter === "ALL" || appointment.status === statusFilter);
      })
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }, [appointments, keyword, dateFilter, barberFilter, statusFilter]);

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
              refundBankName: refundBankName.trim() || undefined,
              refundAccountNumber: refundAccountNumber.trim() || undefined,
              refundAccountName: refundAccountName.trim() || undefined,
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
    <><ClientHeader /><div className="history-page">
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

        <section className="history-filters">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên khách hoặc mã lịch" />
          <input value={barberFilter} onChange={(event) => setBarberFilter(event.target.value)} placeholder="Tên Barber" />
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "ALL")}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(appointmentStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </section>

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
            {filteredAppointments.map(
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
                    <div>
                      <span>Tổng tiền</span>

                      <strong className="history-total-price">
                        {formatPrice(
                          appointment.totalPrice
                        )}
                        đ
                      </strong>
                    </div>
                    {appointment.voucherCode && (
                      <div className="history-voucher-card">
                        <span>Voucher đã chọn</span>
                        <strong>{appointment.voucherCode}</strong>
                        <small>
                          Đã áp dụng khi đặt lịch: -{formatPrice(appointment.finalDiscountAmount ?? appointment.discountAmount)}đ
                        </small>
                      </div>
                    )}
                    <div><span>Đặt cọc</span><strong>{appointment.depositRequired ? `${formatPrice(appointment.depositAmount)}đ · ${appointment.depositPaid ? "Đã cọc" : "Chưa cọc"}` : "Không yêu cầu"}</strong></div>

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
                    {canReschedule(appointment) && (
                      <button
                        type="button"
                        className="history-payment-button"
                        onClick={() => {
                          setRescheduleTarget(appointment);
                          setRescheduleDate(appointment.appointmentDate);
                          setRescheduleTime("");
                          setError("");
                        }}
                      >
                        Đổi thời gian
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
      {cancelTarget && <div className="history-cancel-modal-bg" onMouseDown={() => setCancelTarget(null)}><form className="history-cancel-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void handleCancel(cancelTarget); }}><h2>Yêu cầu hủy lịch</h2><p>Mã lịch: <b>{cancelTarget.appointmentCode}</b></p><p>{formatDate(cancelTarget.appointmentDate)} · {cancelTarget.startTime}–{cancelTarget.endTime}</p><label>Lý do hủy<textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} required placeholder="Mô tả lý do bạn cần hủy lịch..." /></label>{cancelTarget.depositPaid && new Date(`${cancelTarget.appointmentDate}T${cancelTarget.startTime}:00`).getTime() - Date.now() >= 24 * 60 * 60 * 1000 && <fieldset><legend>Tài khoản nhận hoàn cọc</legend><label>Ngân hàng<select value={refundBankName} onChange={(event) => { setRefundBankName(event.target.value); setRefundAccountName(""); }} required><option value="">Chọn ngân hàng</option><option value="Vietcombank">Vietcombank</option><option value="BIDV">BIDV</option><option value="VietinBank">VietinBank</option><option value="Agribank">Agribank</option><option value="Techcombank">Techcombank</option><option value="MB Bank">MB Bank</option><option value="ACB">ACB</option><option value="VPBank">VPBank</option></select></label><label>Số tài khoản<input inputMode="numeric" pattern="[0-9]{6,20}" value={refundAccountNumber} onChange={(event) => { setRefundAccountNumber(event.target.value.replace(/\D/g, "")); setRefundAccountName(""); }} required /></label><label>Tên chủ tài khoản<input value={refundAccountName} onChange={(event) => setRefundAccountName(event.target.value.toUpperCase())} required placeholder="Tên do ngân hàng xác nhận" /></label></fieldset>}<small>{cancelTarget.depositPaid && new Date(`${cancelTarget.appointmentDate}T${cancelTarget.startTime}:00`).getTime() - Date.now() >= 24 * 60 * 60 * 1000 ? "Hủy trước ít nhất 24 giờ: hoàn 100% tiền cọc." : "Hủy dưới 24 giờ: không hoàn tiền cọc."}</small><div><button type="button" onClick={() => setCancelTarget(null)}>Đóng</button><button type="submit" disabled={cancellingId === cancelTarget._id}>Xác nhận hủy</button></div></form></div>}
      {rescheduleTarget && (
        <div className="history-cancel-modal-bg" onMouseDown={() => setRescheduleTarget(null)}>
          <section className="history-cancel-modal history-reschedule-modal" onMouseDown={(event) => event.stopPropagation()}>
            <h2>Đổi thời gian lịch hẹn</h2>
            <p>Mã lịch: <b>{rescheduleTarget.appointmentCode}</b></p>
            <label>Ngày hẹn mới<input type="date" min={new Date().toISOString().slice(0, 10)} value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} /></label>
            <p>Chỉ hiển thị thời gian Barber rảnh:</p>
            <div className="history-reschedule-slots">
              {rescheduleSlots.map((slot) => <button type="button" key={slot.startTime} className={rescheduleTime === slot.startTime ? "selected" : ""} onClick={() => setRescheduleTime(slot.startTime)}>{slot.startTime}<small>{slot.endTime}</small></button>)}
              {rescheduleDate && !rescheduleSlots.length && <small>Không còn khung giờ phù hợp trong ngày này.</small>}
            </div>
            <div><button type="button" onClick={() => setRescheduleTarget(null)}>Đóng</button><button type="button" disabled={rescheduling || !rescheduleTime} onClick={() => void handleReschedule()}>{rescheduling ? "Đang đổi..." : "Xác nhận đổi lịch"}</button></div>
          </section>
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
    </div></>
  );
}

export default BookingHistory;
