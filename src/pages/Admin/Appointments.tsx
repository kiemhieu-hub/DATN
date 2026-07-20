import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  changeAdminAppointmentBarber,
  deleteAdminAppointment,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "../../services/adminAppointment.service";
import { getCatalogBarbers } from "../../services/catalog.service";
import { confirmCashPayment } from "../../services/payment.service";

import type {
  Appointment,
  AppointmentStatus,
} from "../../types/Appointment";
import type { CatalogBarber } from "../../types/Catalog";

import "./css/Appointments.css";

interface StatusAction {
  status: AppointmentStatus;
  label: string;
}

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<
  Appointment["paymentStatus"],
  string
> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang xử lý",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

const nextActions: Partial<
  Record<AppointmentStatus, StatusAction[]>
> = {
  PENDING: [
    {
      status: "CONFIRMED",
      label: "Xác nhận",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
  CONFIRMED: [
    {
      status: "CHECKED_IN",
      label: "Check-in",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
  CHECKED_IN: [
    { status: "IN_PROGRESS", label: "Bắt đầu" },
  ],
  NO_SHOW: [
    { status: "IN_PROGRESS", label: "Bật lại" },
  ],
  IN_PROGRESS: [
    {
      status: "COMPLETED",
      label: "Hoàn thành",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const getUserName = (
  value: Appointment["client"] | Appointment["barber"]
): string => {
  if (typeof value === "string") {
    return "Không xác định";
  }

  return value.fullName;
};

const getErrorMessage = (
  error: unknown,
  fallback = "Có lỗi xảy ra"
): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return responseData?.message || fallback;
  }

  return fallback;
};

function Appointments() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth("ADMIN");

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [barbers, setBarbers] =
    useState<CatalogBarber[]>([]);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatus | "ALL">("ALL");

  const [barberFilter, setBarberFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [selectedBarberId, setSelectedBarberId] =
    useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAppointments({
        keyword: submittedKeyword || undefined,
        status: statusFilter,
        barberId: barberFilter || undefined,
        appointmentDate: dateFilter || undefined,
        page,
        limit: 10,
      });

      setAppointments(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể tải danh sách lịch hẹn"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [
    submittedKeyword,
    statusFilter,
    barberFilter,
    dateFilter,
    page,
  ]);

  const loadBarbers = useCallback(async () => {
    try {
      const response = await getCatalogBarbers();
      setBarbers(response.barbers);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể tải danh sách Barber"
        )
      );
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    void loadAppointments();
    void loadBarbers();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadAppointments,
    loadBarbers,
  ]);

  const handleSearch = (event: FormEvent): void => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  const openDetail = (appointment: Appointment): void => {
    setSelectedAppointment(appointment);

    const currentBarberId =
      typeof appointment.barber === "string"
        ? appointment.barber
        : appointment.barber._id;

    setSelectedBarberId(currentBarberId);
    setError("");
  };

  const closeDetail = (): void => {
    if (processingId) {
      return;
    }

    setSelectedAppointment(null);
    setSelectedBarberId("");
  };

  const handleChangeStatus = async (
    appointment: Appointment,
    targetStatus: AppointmentStatus
  ): Promise<void> => {
    let cancellationReason: string | undefined;

    if (targetStatus === "CANCELLED") {
      const inputReason = window.prompt(
        "Nhập lý do hủy lịch:"
      );

      if (inputReason === null) {
        return;
      }

      if (!inputReason.trim()) {
        setError("Lý do hủy không được để trống");
        return;
      }

      cancellationReason = inputReason.trim();
    } else {
      const confirmed = window.confirm(
        `Chuyển lịch sang “${statusLabels[targetStatus]}”?`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");

      const response =
        await updateAdminAppointmentStatus(
          appointment._id,
          targetStatus,
          cancellationReason
        );

      setMessage(response.message);

      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể cập nhật trạng thái lịch hẹn"
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeBarber = async (): Promise<void> => {
    if (!selectedAppointment) {
      return;
    }

    if (!selectedBarberId) {
      setError("Vui lòng chọn Barber mới");
      return;
    }

    try {
      setProcessingId(selectedAppointment._id);
      setError("");
      setMessage("");

      const response = await changeAdminAppointmentBarber(
        selectedAppointment._id,
        selectedBarberId
      );

      setMessage(response.message);
      setSelectedAppointment(response.appointment);

      await loadAppointments();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể đổi Barber"
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCashPayment = async (
    appointment: Appointment
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Xác nhận đã nhận ${formatMoney(
        appointment.totalPrice
      )}đ tiền mặt từ khách hàng?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");

      const response = await confirmCashPayment(
        appointment._id
      );

      setMessage(response.message);

      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể xác nhận thanh toán tiền mặt"
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment): Promise<void> => {
    if (!window.confirm(`Xóa vĩnh viễn lịch hẹn ${appointment.appointmentCode || appointment._id}? Hóa đơn và review liên quan cũng sẽ bị xóa.`)) return;
    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");
      const response = await deleteAdminAppointment(appointment._id);
      setMessage(response.message);
      if (selectedAppointment?._id === appointment._id) setSelectedAppointment(null);
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể xóa lịch hẹn."));
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || (loading && appointments.length === 0)) {
    return (
      <div className="admin-appointments-page">
        <div className="appointment-loading">
          <div className="appointment-loading-spinner" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-appointments-page">
      <main className="admin-appointments-container">
        <header className="admin-appointments-header">
          <div className="admin-appointments-title">
            <p className="admin-appointments-brand">
              THADS BARBER
            </p>

            <h1>Quản lý lịch hẹn</h1>

            <p className="admin-appointments-description">
              Theo dõi và xử lý toàn bộ lịch hẹn trong hệ thống.
            </p>
          </div>

          <nav className="admin-appointments-navigation">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/services">Dịch vụ</Link>
            <Link to="/admin/barbers">Barber</Link>
          </nav>
        </header>

        {error && (
          <div className="appointment-alert appointment-alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="appointment-alert appointment-alert-success">
            {message}
          </div>
        )}

        <form
          className="appointment-filters"
          onSubmit={handleSearch}
        >
          <div className="appointment-filter-field appointment-filter-search">
            <label htmlFor="appointment-keyword">
              Tìm khách hàng
            </label>
            <input
              id="appointment-keyword"
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
              placeholder="Tên, email hoặc số điện thoại"
            />
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-status">
              Trạng thái
            </label>
            <select
              id="appointment-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as AppointmentStatus | "ALL"
                );
                setPage(1);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>

              {Object.entries(statusLabels).map(
                ([statusValue, label]) => (
                  <option
                    key={statusValue}
                    value={statusValue}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-barber">
              Barber
            </label>
            <select
              id="appointment-barber"
              value={barberFilter}
              onChange={(event) => {
                setBarberFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả Barber</option>

              {barbers.map((barber) => (
                <option
                  key={barber.id}
                  value={barber.id}
                >
                  {barber.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-date">
              Ngày hẹn
            </label>
            <input
              id="appointment-date"
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            type="submit"
            className="appointment-search-button"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Barber</th>
                <th>Dịch vụ</th>
                <th>Thời gian</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="appointment-empty"
                  >
                    Không có lịch hẹn phù hợp.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong className="appointment-customer-name">
                        {getUserName(appointment.client)}
                      </strong>

                      {typeof appointment.client !== "string" && (
                        <div className="appointment-customer-contact">
                          <span>{appointment.client.phone}</span>
                          <span>{appointment.client.email}</span>
                        </div>
                      )}
                    </td>

                    <td>{getUserName(appointment.barber)}</td>

                    <td>
                      <div className="appointment-service-list">
                        {appointment.services.map((service) => (
                          <span key={`${appointment._id}-${service.nameSnapshot}`}>
                            {service.nameSnapshot}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <strong>{formatDate(appointment.appointmentDate)}</strong>
                      <span className="appointment-time">
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </td>

                    <td className="appointment-price">
                      {formatMoney(appointment.totalPrice)}đ
                    </td>

                    <td>
                      <div className="appointment-status-list">
                        <span
                          className={`appointment-status appointment-status-${appointment.status.toLowerCase()}`}
                        >
                          {statusLabels[appointment.status]}
                        </span>

                        <span
                          className={`appointment-payment-status appointment-payment-${appointment.paymentStatus.toLowerCase()}`}
                        >
                          {paymentStatusLabels[appointment.paymentStatus]}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="appointment-actions">
                        <button
                          type="button"
                          className="appointment-action-detail"
                          onClick={() => openDetail(appointment)}
                        >
                          Chi tiết
                        </button>

                        {(nextActions[appointment.status] ?? []).map(
                          (action) => (
                            <button
                              type="button"
                              key={action.status}
                              disabled={processingId === appointment._id}
                              className={
                                action.status === "CANCELLED"
                                  ? "appointment-action-cancel"
                                  : "appointment-action-primary"
                              }
                              onClick={() =>
                                void handleChangeStatus(
                                  appointment,
                                  action.status
                                )
                              }
                            >
                              {action.label}
                            </button>
                          )
                        )}

                        {["IN_PROGRESS", "COMPLETED"].includes(
                          appointment.status
                        ) && appointment.paymentStatus !== "PAID" && (
                          <button
                            type="button"
                            className="appointment-action-payment"
                            disabled={processingId === appointment._id}
                            onClick={() =>
                              void handleCashPayment(appointment)
                            }
                          >
                            Thu tiền
                          </button>
                        )}

                        <button
                          type="button"
                          className="appointment-action-delete"
                          disabled={processingId === appointment._id}
                          onClick={() => void handleDeleteAppointment(appointment)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="appointment-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Trang trước
          </button>

          <span>
            Trang {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Trang sau
          </button>
        </div>
      </main>

      {selectedAppointment && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={closeDetail}
        >
          <section
            className="appointment-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="appointment-modal-close"
              onClick={closeDetail}
            >
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2>Chi tiết lịch hẹn</h2>

            <div className="appointment-detail-grid">
              <div>
                <span>Khách hàng</span>
                <strong>{getUserName(selectedAppointment.client)}</strong>
              </div>

              <div>
                <span>Barber</span>
                <strong>{getUserName(selectedAppointment.barber)}</strong>
              </div>

              <div>
                <span>Ngày hẹn</span>
                <strong>
                  {formatDate(selectedAppointment.appointmentDate)}
                </strong>
              </div>

              <div>
                <span>Khung giờ</span>
                <strong>
                  {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </strong>
              </div>

              <div>
                <span>Thời lượng</span>
                <strong>{selectedAppointment.durationMinutes} phút</strong>
              </div>

              <div>
                <span>Thanh toán</span>
                <strong>
                  {paymentStatusLabels[selectedAppointment.paymentStatus]}
                </strong>
              </div>
            </div>

            <h3>Dịch vụ</h3>

            <ul className="appointment-detail-services">
              {selectedAppointment.services.map((service, index) => (
                <li key={`${service.nameSnapshot}-${index}`}>
                  <span>
                    {service.nameSnapshot}
                    <small>{service.durationSnapshot} phút</small>
                  </span>

                  <strong>{formatMoney(service.priceSnapshot)}đ</strong>
                </li>
              ))}
            </ul>

            <div className="appointment-detail-total">
              <span>Tổng tiền</span>
              <strong>
                {formatMoney(selectedAppointment.totalPrice)}đ
              </strong>
            </div>

            <div className="appointment-detail-note">
              <strong>Ghi chú:</strong>
              <span>{selectedAppointment.note || "Không có ghi chú"}</span>
            </div>

            {selectedAppointment.cancellation && (
              <div className="appointment-cancel-reason">
                <strong>Lý do hủy:</strong>
                <span>{selectedAppointment.cancellation.reason}</span>
              </div>
            )}

            {["IN_PROGRESS", "COMPLETED"].includes(
              selectedAppointment.status
            ) && selectedAppointment.paymentStatus !== "PAID" && (
              <button
                type="button"
                className="appointment-modal-payment-button"
                disabled={processingId === selectedAppointment._id}
                onClick={() =>
                  void handleCashPayment(selectedAppointment)
                }
              >
                {processingId === selectedAppointment._id
                  ? "Đang xác nhận..."
                  : `Xác nhận thu ${formatMoney(
                      selectedAppointment.totalPrice
                    )}đ tiền mặt`}
              </button>
            )}

            {!["COMPLETED", "CANCELLED"].includes(
              selectedAppointment.status
            ) && (
              <div className="appointment-change-barber">
                <label htmlFor="new-barber">
                  Đổi Barber
                  <select
                    id="new-barber"
                    value={selectedBarberId}
                    onChange={(event) =>
                      setSelectedBarberId(event.target.value)
                    }
                  >
                    {barbers.map((barber) => (
                      <option
                        key={barber.id}
                        value={barber.id}
                      >
                        {barber.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  disabled={processingId === selectedAppointment._id}
                  onClick={() => void handleChangeBarber()}
                >
                  {processingId === selectedAppointment._id
                    ? "Đang lưu..."
                    : "Lưu Barber"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Appointments;
