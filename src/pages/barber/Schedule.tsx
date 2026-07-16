import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  getBarberAppointments,
  updateBarberAppointmentStatus,
} from "../../services/barberAppointment.service";

import type {
  Appointment,
  AppointmentStatus,
} from "../../types/Appointment";

import "./css/Schedule.css";

type StatusFilter =
  | "ALL"
  | AppointmentStatus;

const statusLabels: Record<
  AppointmentStatus,
  string
> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const formatPrice = (
  value: number
): string =>
  new Intl.NumberFormat("vi-VN").format(
    value
  );

const formatDuration = (
  minutes: number
): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes =
    minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  if (hours > 0) {
    return `${hours} giờ`;
  }

  return `${remainingMinutes} phút`;
};

const formatDate = (
  value: string
): string => {
  const [year, month, day] =
    value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const getToday = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getClientName = (
  appointment: Appointment
): string => {
  if (
    typeof appointment.client ===
    "string"
  ) {
    return "Khách hàng";
  }

  return appointment.client.fullName;
};

const getClientPhone = (
  appointment: Appointment
): string => {
  if (
    typeof appointment.client ===
    "string"
  ) {
    return "Không có thông tin";
  }

  return (
    appointment.client.phone ||
    "Chưa cập nhật"
  );
};

const getClientEmail = (
  appointment: Appointment
): string => {
  if (
    typeof appointment.client ===
    "string"
  ) {
    return "Không có thông tin";
  }

  return appointment.client.email;
};

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const data =
      error.response?.data as
        | {
            message?: string;
          }
        | undefined;

    return data?.message || fallback;
  }

  return fallback;
};

const getNextStatus = (
  status: AppointmentStatus
): AppointmentStatus | null => {
  switch (status) {
    case "PENDING":
      return "CONFIRMED";

    case "CONFIRMED":
      return "IN_PROGRESS";

    case "IN_PROGRESS":
      return "COMPLETED";

    default:
      return null;
  }
};

const getNextStatusLabel = (
  status: AppointmentStatus
): string => {
  switch (status) {
    case "PENDING":
      return "Xác nhận lịch";

    case "CONFIRMED":
      return "Bắt đầu thực hiện";

    case "IN_PROGRESS":
      return "Hoàn thành";

    default:
      return "";
  }
};

function Schedule() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuth();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(getToday());

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadAppointments =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getBarberAppointments({
            appointmentDate:
              selectedDate || undefined,

            status:
              statusFilter === "ALL"
                ? undefined
                : statusFilter,
          });

        setAppointments(
          response.appointments
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải lịch hẹn."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      selectedDate,
      statusFilter,
    ]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Bạn cần đăng nhập bằng tài khoản Barber.",
        },
      });

      return;
    }

    if (user.role !== "BARBER") {
      navigate("/", {
        replace: true,
      });

      return;
    }

    void loadAppointments();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadAppointments,
  ]);

  const statistics = useMemo(() => {
    return {
      total: appointments.length,

      pending: appointments.filter(
        (appointment) =>
          appointment.status ===
          "PENDING"
      ).length,

      confirmed: appointments.filter(
        (appointment) =>
          appointment.status ===
          "CONFIRMED"
      ).length,

      inProgress: appointments.filter(
        (appointment) =>
          appointment.status ===
          "IN_PROGRESS"
      ).length,

      completed: appointments.filter(
        (appointment) =>
          appointment.status ===
          "COMPLETED"
      ).length,
    };
  }, [appointments]);

  const handleUpdateStatus = async (
    appointment: Appointment
  ): Promise<void> => {
    const nextStatus = getNextStatus(
      appointment.status
    );

    if (!nextStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn chuyển lịch sang trạng thái "${statusLabels[nextStatus]}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        appointment._id
      );

      setError("");
      setMessage("");

      const response =
        await updateBarberAppointmentStatus(
          appointment._id,
          {
            status: nextStatus,
          }
        );

      setMessage(response.message);

      setAppointments(
        (currentAppointments) =>
          currentAppointments.map(
            (currentAppointment) =>
              currentAppointment._id ===
              response.appointment._id
                ? response.appointment
                : currentAppointment
          )
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể cập nhật trạng thái."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (
    appointment: Appointment
  ): Promise<void> => {
    const reason = window.prompt(
      "Nhập lý do Barber hủy lịch:",
      "Barber không thể phục vụ trong khung giờ này"
    );

    if (reason === null) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn hủy lịch của ${getClientName(
        appointment
      )} không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        appointment._id
      );

      setError("");
      setMessage("");

      const response =
        await updateBarberAppointmentStatus(
          appointment._id,
          {
            status: "CANCELLED",
            reason:
              reason.trim() ||
              "Barber hủy lịch",
          }
        );

      setMessage(response.message);

      setAppointments(
        (currentAppointments) =>
          currentAppointments.map(
            (currentAppointment) =>
              currentAppointment._id ===
              response.appointment._id
                ? response.appointment
                : currentAppointment
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
      setUpdatingId(null);
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  if (authLoading) {
    return (
      <div className="barber-schedule-page">
        <div className="barber-loading-card">
          Đang kiểm tra tài khoản...
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "BARBER"
  ) {
    return null;
  }

  return (
    <div className="barber-schedule-page">
      <main className="barber-schedule-container">
        <header className="barber-schedule-header">
          <div>
            <p className="barber-schedule-brand">
              THADS Barber
            </p>

            <h1>Lịch làm việc</h1>

            <p>
              Xin chào, {user.fullName}
            </p>
          </div>

          <div className="barber-header-actions">
            <Link to="/barber/dashboard">
              Trang chủ
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="barber-statistics">
          <article>
            <span>Tổng lịch</span>
            <strong>
              {statistics.total}
            </strong>
          </article>

          <article>
            <span>Chờ xác nhận</span>
            <strong>
              {statistics.pending}
            </strong>
          </article>

          <article>
            <span>Đã xác nhận</span>
            <strong>
              {statistics.confirmed}
            </strong>
          </article>

          <article>
            <span>Đang thực hiện</span>
            <strong>
              {statistics.inProgress}
            </strong>
          </article>

          <article>
            <span>Hoàn thành</span>
            <strong>
              {statistics.completed}
            </strong>
          </article>
        </section>

        <section className="barber-filters">
          <div>
            <label htmlFor="scheduleDate">
              Ngày làm việc
            </label>

            <input
              id="scheduleDate"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(
                  event.target.value
                );
                setMessage("");
              }}
            />
          </div>

          <div>
            <label htmlFor="statusFilter">
              Trạng thái
            </label>

            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                );

                setMessage("");
              }}
            >
              <option value="ALL">
                Tất cả
              </option>

              <option value="PENDING">
                Chờ xác nhận
              </option>

              <option value="CONFIRMED">
                Đã xác nhận
              </option>

              <option value="IN_PROGRESS">
                Đang thực hiện
              </option>

              <option value="COMPLETED">
                Đã hoàn thành
              </option>

              <option value="CANCELLED">
                Đã hủy
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAppointments()
            }
          >
            Làm mới
          </button>
        </section>

        {message && (
          <p className="barber-message barber-success">
            {message}
          </p>
        )}

        {error && (
          <p className="barber-message barber-error">
            {error}
          </p>
        )}

        {loading ? (
          <div className="barber-loading-card">
            Đang tải lịch hẹn...
          </div>
        ) : appointments.length === 0 ? (
          <section className="barber-empty">
            <h2>Không có lịch hẹn</h2>

            <p>
              Chưa có lịch nào trong ngày
              {selectedDate
                ? ` ${formatDate(
                    selectedDate
                  )}`
                : ""}
              .
            </p>
          </section>
        ) : (
          <section className="barber-appointment-list">
            {appointments.map(
              (appointment) => (
                <article
                  className="barber-appointment-card"
                  key={appointment._id}
                >
                  <div className="barber-appointment-time">
                    <strong>
                      {appointment.startTime}
                    </strong>

                    <span>
                      đến {appointment.endTime}
                    </span>

                    <small>
                      {formatDuration(
                        appointment.durationMinutes
                      )}
                    </small>
                  </div>

                  <div className="barber-appointment-content">
                    <div className="barber-appointment-heading">
                      <div>
                        <h2>
                          {getClientName(
                            appointment
                          )}
                        </h2>

                        <p>
                          {getClientPhone(
                            appointment
                          )}
                          {" · "}
                          {getClientEmail(
                            appointment
                          )}
                        </p>
                      </div>

                      <span
                        className={`barber-status status-${appointment.status.toLowerCase()}`}
                      >
                        {
                          statusLabels[
                            appointment.status
                          ]
                        }
                      </span>
                    </div>

                    <div className="barber-services">
                      <span>Dịch vụ</span>

                      <ul>
                        {appointment.services.map(
                          (
                            service,
                            index
                          ) => (
                            <li
                              key={`${service.nameSnapshot}-${index}`}
                            >
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
                    </div>

                    <div className="barber-appointment-summary">
                      <div>
                        <span>Ngày hẹn</span>

                        <strong>
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Tổng tiền</span>

                        <strong>
                          {formatPrice(
                            appointment.totalPrice
                          )}
                          đ
                        </strong>
                      </div>

                      <div>
                        <span>Thanh toán</span>

                        <strong>
                          {
                            appointment.paymentStatus
                          }
                        </strong>
                      </div>
                    </div>

                    {appointment.note && (
                      <div className="barber-note">
                        <span>Ghi chú</span>

                        <p>
                          {appointment.note}
                        </p>
                      </div>
                    )}

                    {appointment.status ===
                      "CANCELLED" &&
                      appointment.cancellation && (
                        <div className="barber-cancel-reason">
                          <span>Lý do hủy</span>

                          <p>
                            {
                              appointment
                                .cancellation
                                .reason
                            }
                          </p>
                        </div>
                      )}

                    <footer className="barber-appointment-actions">
                      {getNextStatus(
                        appointment.status
                      ) && (
                        <button
                          type="button"
                          className="barber-primary-action"
                          disabled={
                            updatingId ===
                            appointment._id
                          }
                          onClick={() =>
                            void handleUpdateStatus(
                              appointment
                            )
                          }
                        >
                          {updatingId ===
                          appointment._id
                            ? "Đang xử lý..."
                            : getNextStatusLabel(
                                appointment.status
                              )}
                        </button>
                      )}

                      {[
                        "PENDING",
                        "CONFIRMED",
                      ].includes(
                        appointment.status
                      ) && (
                        <button
                          type="button"
                          className="barber-cancel-action"
                          disabled={
                            updatingId ===
                            appointment._id
                          }
                          onClick={() =>
                            void handleCancel(
                              appointment
                            )
                          }
                        >
                          Hủy lịch
                        </button>
                      )}
                    </footer>
                  </div>
                </article>
              )
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Schedule;