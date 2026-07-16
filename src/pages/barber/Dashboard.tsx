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
import { getBarberDashboard } from "../../services/barberDashboard.service";

import type {
  BarberDashboardAppointment,
  BarberDashboardData,
} from "../../types/BarberDashboard";

import "./css/Dashboard.css";

const formatPrice = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");
  return year && month && day
    ? `${day}/${month}/${year}`
    : value;
};

const formatDuration = (
  totalMinutes: number
): string => {
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

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string }
      | undefined;

    return data?.message || fallback;
  }

  return fallback;
};

const getClientName = (
  appointment: BarberDashboardAppointment
): string =>
  appointment.client?.fullName ?? "Khách hàng";

const getClientPhone = (
  appointment: BarberDashboardAppointment
): string =>
  appointment.client?.phone ?? "Chưa cập nhật";

const statusLabels: Record<
  BarberDashboardAppointment["status"],
  string
> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuth();

  const [dashboard, setDashboard] =
    useState<BarberDashboardData | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getBarberDashboard();

        setDashboard(response.data);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải Dashboard Barber."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;

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
      navigate("/", { replace: true });
      return;
    }

    void loadDashboard();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadDashboard,
  ]);

  const upcomingAppointments = useMemo(
    () =>
      dashboard?.todayAppointments.filter(
        (appointment) =>
          appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED" ||
          appointment.status === "IN_PROGRESS"
      ) ?? [],
    [dashboard]
  );

  const handleLogout = (): void => {
    logout();
    navigate("/login", { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="barber-dashboard-page">
        <div className="barber-dashboard-loading">
          <div className="barber-dashboard-spinner" />
          <p>Đang tải Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "BARBER") {
    return null;
  }

  return (
    <div className="barber-dashboard-page">
      <main className="barber-dashboard-container">
        <header className="barber-dashboard-header">
          <div>
            <p className="barber-dashboard-brand">
              THADS Barber
            </p>
            <h1>Dashboard Barber</h1>
            <p>
              Xin chào, {user.fullName}. Đây là tổng quan công việc hôm nay.
            </p>
          </div>

          <div className="barber-dashboard-header-actions">
            <Link to="/barber/schedule">
              Lịch hẹn
            </Link>
            <Link to="/barber/working-schedule">
              Lịch làm việc
            </Link>
            <button
              type="button"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {error && (
          <div className="barber-dashboard-message barber-dashboard-error">
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
            >
              Thử lại
            </button>
          </div>
        )}

        {dashboard && (
          <>
            <section className="barber-dashboard-date-banner">
              <div>
                <span>Ngày làm việc</span>
                <strong>
                  {formatDate(dashboard.date)}
                </strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadDashboard()
                }
              >
                Làm mới dữ liệu
              </button>
            </section>

            <section className="barber-dashboard-statistics">
              <article>
                <span>Tổng lịch</span>
                <strong>{dashboard.statistics.total}</strong>
              </article>
              <article>
                <span>Chờ xác nhận</span>
                <strong>{dashboard.statistics.pending}</strong>
              </article>
              <article>
                <span>Đã xác nhận</span>
                <strong>{dashboard.statistics.confirmed}</strong>
              </article>
              <article>
                <span>Đang thực hiện</span>
                <strong>{dashboard.statistics.inProgress}</strong>
              </article>
              <article>
                <span>Đã hoàn thành</span>
                <strong>{dashboard.statistics.completed}</strong>
              </article>
              <article>
                <span>Đã hủy</span>
                <strong>{dashboard.statistics.cancelled}</strong>
              </article>
            </section>

            <section className="barber-dashboard-main-grid">
              <article className="barber-dashboard-revenue-card">
                <div>
                  <span>Doanh thu hôm nay</span>
                  <strong>
                    {formatPrice(
                      dashboard.statistics.todayRevenue
                    )}
                    đ
                  </strong>
                  <p>
                    Chỉ tính lịch đã hoàn thành và đã thanh toán.
                  </p>
                </div>

                <Link to="/barber/schedule">
                  Xem lịch hôm nay
                </Link>
              </article>

              <article className="barber-dashboard-next-card">
                <div className="barber-dashboard-section-heading">
                  <div>
                    <span>Lịch tiếp theo</span>
                    <h2>
                      {dashboard.nextAppointment
                        ? `${dashboard.nextAppointment.startTime} - ${dashboard.nextAppointment.endTime}`
                        : "Chưa có lịch tiếp theo"}
                    </h2>
                  </div>
                </div>

                {dashboard.nextAppointment ? (
                  <div className="barber-dashboard-next-content">
                    <div className="barber-dashboard-client">
                      <strong>
                        {getClientName(
                          dashboard.nextAppointment
                        )}
                      </strong>
                      <span>
                        {getClientPhone(
                          dashboard.nextAppointment
                        )}
                      </span>
                    </div>

                    <ul>
                      {dashboard.nextAppointment.services.map(
                        (service, index) => (
                          <li key={`${service.name}-${index}`}>
                            <span>{service.name}</span>
                            <small>
                              {formatDuration(
                                service.durationMinutes
                              )}
                            </small>
                          </li>
                        )
                      )}
                    </ul>

                    <div className="barber-dashboard-next-summary">
                      <span>
                        Tổng thời gian:{" "}
                        {formatDuration(
                          dashboard.nextAppointment.durationMinutes
                        )}
                      </span>
                      <strong>
                        {formatPrice(
                          dashboard.nextAppointment.totalPrice
                        )}
                        đ
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="barber-dashboard-empty-text">
                    Không có lịch đang chờ, đã xác nhận hoặc đang thực hiện.
                  </p>
                )}
              </article>
            </section>

            <section className="barber-dashboard-today-section">
              <div className="barber-dashboard-section-heading">
                <div>
                  <span>Lịch trong ngày</span>
                  <h2>
                    {upcomingAppointments.length} lịch cần xử lý
                  </h2>
                </div>

                <Link to="/barber/schedule">
                  Xem toàn bộ
                </Link>
              </div>

              {dashboard.todayAppointments.length === 0 ? (
                <p className="barber-dashboard-empty-text">
                  Hôm nay chưa có lịch hẹn.
                </p>
              ) : (
                <div className="barber-dashboard-appointment-list">
                  {dashboard.todayAppointments.map(
                    (appointment) => (
                      <article
                        className="barber-dashboard-appointment-card"
                        key={appointment._id}
                      >
                        <div className="barber-dashboard-appointment-time">
                          <strong>{appointment.startTime}</strong>
                          <span>đến {appointment.endTime}</span>
                        </div>

                        <div className="barber-dashboard-appointment-info">
                          <div>
                            <strong>
                              {getClientName(appointment)}
                            </strong>
                            <span>
                              {appointment.services
                                .map((service) => service.name)
                                .join(", ")}
                            </span>
                          </div>

                          <small>
                            {formatDuration(
                              appointment.durationMinutes
                            )}
                          </small>
                        </div>

                        <div className="barber-dashboard-appointment-meta">
                          <span
                            className={`barber-dashboard-status status-${appointment.status.toLowerCase()}`}
                          >
                            {statusLabels[appointment.status]}
                          </span>
                          <strong>
                            {formatPrice(appointment.totalPrice)}đ
                          </strong>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="barber-dashboard-shortcuts">
              <Link to="/barber/schedule">
                <span>Quản lý lịch hẹn</span>
                <small>
                  Xác nhận, bắt đầu, hoàn thành hoặc hủy lịch
                </small>
              </Link>

              <Link to="/barber/working-schedule">
                <span>Quản lý lịch làm việc</span>
                <small>
                  Chỉnh ngày làm, giờ làm và khoảng nghỉ
                </small>
              </Link>

              <Link to="/">
                <span>Trang chủ</span>
                <small>
                  Quay về giao diện chính của THADS Barber
                </small>
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;