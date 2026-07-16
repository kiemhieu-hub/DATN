import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  cancelAppointment,
  getMyAppointments,
} from "../../services/appointment.service";

import type {
  Appointment,
  AppointmentService,
  AppointmentStatus,
} from "../../types/Appointment";

import "./css/BookingHistory.css";

interface LocationState {
  message?: string;
}


type LegacyAppointment = Omit<
  Appointment,
  | "services"
  | "totalPrice"
  | "durationMinutes"
  | "endTime"
> & {
  serviceName?: string;
  servicePrice?: number;

  services?: AppointmentService[];
  totalPrice?: number;
  durationMinutes?: number;
  endTime?: string;
};

const statusLabels: Record<
  AppointmentStatus,
  string
> = {
  PENDING: "Đang chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (
  dateString: string
): string => {
  const [year, month, day] =
    dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}/${month}/${year}`;
};

const formatCreatedAt = (
  dateString: string
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("vi-VN");
};

const formatDuration = (
  totalMinutes: number
): string => {
  if (
    typeof totalMinutes !== "number" ||
    totalMinutes <= 0
  ) {
    return "Chưa xác định";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }

  if (hours > 0) {
    return `${hours} giờ`;
  }

  return `${minutes} phút`;
};

/*
 * Chuyển dữ liệu cũ:
 * serviceName + servicePrice
 *
 * thành dữ liệu mới:
 * services[]
 */
const getAppointmentServices = (
  appointment: LegacyAppointment
): AppointmentService[] => {
  if (
    Array.isArray(appointment.services) &&
    appointment.services.length > 0
  ) {
    return appointment.services;
  }

  if (
    typeof appointment.serviceName === "string" &&
    appointment.serviceName.trim() &&
    typeof appointment.servicePrice === "number"
  ) {
    return [
      {
        name: appointment.serviceName,
        price: appointment.servicePrice,
      },
    ];
  }

  return [];
};

const getAppointmentTotalPrice = (
  appointment: LegacyAppointment
): number => {
  if (
    typeof appointment.totalPrice === "number"
  ) {
    return appointment.totalPrice;
  }

  if (
    typeof appointment.servicePrice === "number"
  ) {
    return appointment.servicePrice;
  }

  return getAppointmentServices(
    appointment
  ).reduce(
    (total, service) =>
      total + service.price,
    0
  );
};

const getAppointmentDuration = (
  appointment: LegacyAppointment
): number => {
  if (
    typeof appointment.durationMinutes ===
      "number" &&
    appointment.durationMinutes > 0
  ) {
    return appointment.durationMinutes;
  }

  /*
   * Dữ liệu lịch cũ chưa có thời lượng.
   * Tạm hiển thị 60 phút.
   */
  return 60;
};

const getAppointmentEndTime = (
  appointment: LegacyAppointment
): string => {
  if (
    typeof appointment.endTime === "string" &&
    appointment.endTime
  ) {
    return appointment.endTime;
  }

  const [hourText, minuteText] =
    appointment.timeSlot.split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return "Chưa xác định";
  }

  const totalMinutes =
    hour * 60 +
    minute +
    getAppointmentDuration(appointment);

  const endHour =
    Math.floor(totalMinutes / 60);
  const endMinute =
    totalMinutes % 60;

  return `${String(endHour).padStart(
    2,
    "0"
  )}:${String(endMinute).padStart(2, "0")}`;
};

function BookingHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const locationState =
    location.state as LocationState | null;

  const [appointments, setAppointments] =
    useState<LegacyAppointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState(
      locationState?.message ?? ""
    );

  const [
    cancellingAppointmentId,
    setCancellingAppointmentId,
  ] = useState<string | null>(null);

  const loadAppointments =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyAppointments();

        /*
         * Dùng cách này nếu service trả về:
         * {
         *   success: true,
         *   appointments: [...]
         * }
         */
        setAppointments(
          response.appointments as LegacyAppointment[]
        );
      } catch (requestError) {
        console.error(
          "Lỗi tải lịch sử đặt lịch:",
          requestError
        );

        if (
          axios.isAxiosError(requestError)
        ) {
          setError(
            requestError.response?.data
              ?.message ||
              "Không thể tải lịch sử đặt lịch"
          );
        } else {
          setError(
            "Không thể kết nối đến máy chủ"
          );
        }
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (isLoading) {
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
    isAuthenticated,
    isLoading,
    loadAppointments,
    navigate,
  ]);

  const canCancel = (
    appointment: LegacyAppointment
  ): boolean => {
    return (
      appointment.status === "PENDING" ||
      appointment.status === "CONFIRMED"
    );
  };

  const handleCancel = async (
    appointment: LegacyAppointment
  ): Promise<void> => {
    const cancelReason =
      window.prompt(
        "Nhập lý do hủy lịch:",
        "Tôi có việc đột xuất"
      );

    if (cancelReason === null) {
      return;
    }

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn hủy lịch ngày ${formatDate(
          appointment.appointmentDate
        )}, từ ${appointment.timeSlot} đến ${getAppointmentEndTime(
          appointment
        )} không?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingAppointmentId(
        appointment._id
      );

      setError("");
      setMessage("");

      const response =
        await cancelAppointment(
          appointment._id,
          {
            cancelReason:
              cancelReason.trim() ||
              "Khách hàng hủy lịch",
          }
        );

      setMessage(response.message);

      setAppointments(
        (currentAppointments) =>
          currentAppointments.map(
            (currentAppointment) =>
              currentAppointment._id ===
              response.appointment._id
                ? {
                    ...currentAppointment,
                    ...response.appointment,
                  }
                : currentAppointment
          )
      );
    } catch (requestError) {
      console.error(
        "Lỗi hủy lịch:",
        requestError
      );

      if (
        axios.isAxiosError(requestError)
      ) {
        setError(
          requestError.response?.data
            ?.message ||
            "Không thể hủy lịch"
        );
      } else {
        setError(
          "Không thể kết nối đến máy chủ"
        );
      }
    } finally {
      setCancellingAppointmentId(
        null
      );
    }
  };

  if (isLoading || loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="history-loading-card">
            <div className="history-spinner" />

            <p className="history-loading">
              Đang tải lịch sử đặt lịch...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-heading">
          <p className="history-brand">
            THADS Barber
          </p>

          <h1>Lịch sử đặt lịch</h1>

          <p>
            Theo dõi thời gian, dịch vụ và trạng
            thái các lịch hẹn của bạn
          </p>
        </div>

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
          <div className="history-empty">
            <div className="history-empty-icon">
              <i className="ti-calendar" />
            </div>

            <h2>
              Bạn chưa có lịch hẹn
            </h2>

            <p>
              Hãy đặt lịch để trải nghiệm dịch vụ
              tại THADS Barber.
            </p>

            <Link
              to="/booking"
              className="history-primary-button"
            >
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {appointments.map(
              (appointment) => {
                const services =
                  getAppointmentServices(
                    appointment
                  );

                const totalPrice =
                  getAppointmentTotalPrice(
                    appointment
                  );

                const durationMinutes =
                  getAppointmentDuration(
                    appointment
                  );

                const endTime =
                  getAppointmentEndTime(
                    appointment
                  );

                return (
                  <article
                    className="history-card"
                    key={appointment._id}
                  >
                    <div className="history-card-header">
                      <div>
                        <p className="history-code">
                          Mã lịch:{" "}
                          {appointment._id.slice(
                            -8
                          )}
                        </p>

                        <h2>
                          Lịch hẹn THADS Barber
                        </h2>
                      </div>

                      <span
                        className={`history-status status-${appointment.status.toLowerCase()}`}
                      >
                        {
                          statusLabels[
                            appointment.status
                          ]
                        }
                      </span>
                    </div>

                    <div className="history-time-banner">
                      <div>
                        <span>Giờ bắt đầu</span>

                        <strong>
                          {appointment.timeSlot}
                        </strong>
                      </div>

                      <div className="history-time-arrow">
                        <i className="ti-arrow-right" />
                      </div>

                      <div>
                        <span>Giờ kết thúc</span>

                        <strong>{endTime}</strong>
                      </div>

                      <div className="history-duration">
                        <span>
                          Tổng thời gian
                        </span>

                        <strong>
                          {formatDuration(
                            durationMinutes
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="history-services">
                      <div className="history-section-title">
                        <span>
                          Dịch vụ đã chọn
                        </span>

                        <small>
                          {services.length} dịch vụ
                        </small>
                      </div>

                      {services.length > 0 ? (
                        <ul>
                          {services.map(
                            (service, index) => (
                              <li
                                key={`${service.name}-${index}`}
                              >
                                <div>
                                  <span className="history-service-number">
                                    {index + 1}
                                  </span>

                                  <strong>
                                    {service.name}
                                  </strong>
                                </div>

                                <span>
                                  {formatPrice(
                                    service.price
                                  )}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="history-old-data">
                          Lịch hẹn cũ chưa có thông
                          tin dịch vụ.
                        </p>
                      )}
                    </div>

                    <div className="history-details">
                      <div>
                        <span>Barber</span>

                        <strong>
                          {
                            appointment.barberName
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Ngày hẹn</span>

                        <strong>
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Thời gian</span>

                        <strong>
                          {appointment.timeSlot} -{" "}
                          {endTime}
                        </strong>
                      </div>

                      <div>
                        <span>Tổng tiền</span>

                        <strong className="history-total-price">
                          {formatPrice(
                            totalPrice
                          )}
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
                      appointment.cancelReason && (
                        <div className="history-cancel-reason">
                          <span>
                            Lý do hủy
                          </span>

                          <p>
                            {
                              appointment.cancelReason
                            }
                          </p>
                        </div>
                      )}

                    <div className="history-card-footer">
                      <small>
                        Tạo lúc:{" "}
                        {formatCreatedAt(
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
                            cancellingAppointmentId ===
                            appointment._id
                          }
                          onClick={() => {
                            void handleCancel(
                              appointment
                            );
                          }}
                        >
                          {cancellingAppointmentId ===
                          appointment._id
                            ? "Đang hủy..."
                            : "Hủy lịch"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistory;