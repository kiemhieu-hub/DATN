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
import { getAdminDashboard } from "../../services/adminDashboard.service";

import type {
  AdminDashboardAppointment,
  AdminDashboardData,
  AdminDashboardRevenuePoint,
} from "../../types/AdminDashboard";

import "./css/Dashboard.css";

const appointmentStatusLabels: Record<
  AdminDashboardAppointment["status"],
  string
> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<
  AdminDashboardAppointment["paymentStatus"],
  string
> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang xử lý",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

const formatPrice = (
  value: number
): string =>
  new Intl.NumberFormat("vi-VN").format(
    value
  );

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

const formatDateTime = (
  value: string
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
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

const getUserName = (
  user:
    | string
    | {
        fullName: string;
      }
): string => {
  if (typeof user === "string") {
    return "Không xác định";
  }

  return user.fullName;
};

const getChartHeight = (
  point: AdminDashboardRevenuePoint,
  maxRevenue: number
): number => {
  if (maxRevenue <= 0) {
    return 8;
  }

  return Math.max(
    8,
    Math.round(
      (point.revenue / maxRevenue) *
        100
    )
  );
};

function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] = useState<AdminDashboardData | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminDashboard();

        setDashboard(response.data);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải Dashboard Admin."
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

    if (!isAuthenticated || !user) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Bạn cần đăng nhập bằng tài khoản Admin.",
        },
      });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/", {
        replace: true,
      });
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

  const maxRevenue = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    return Math.max(
      ...dashboard.revenueLastSevenDays.map(
        (point) => point.revenue
      ),
      0
    );
  }, [dashboard]);

  const appointmentCompletionRate =
    useMemo(() => {
      if (
        !dashboard ||
        dashboard.statistics
          .totalAppointments === 0
      ) {
        return 0;
      }

      return Math.round(
        (dashboard.statistics
          .completedAppointments /
          dashboard.statistics
            .totalAppointments) *
          100
      );
    }, [dashboard]);

  const activeAppointmentCount =
    useMemo(() => {
      if (!dashboard) {
        return 0;
      }

      return (
        dashboard.statistics
          .pendingAppointments +
        dashboard.statistics
          .confirmedAppointments +
        dashboard.statistics
          .inProgressAppointments
      );
    }, [dashboard]);

  const handleLogout = (): void => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-dashboard-spinner" />

          <p>
            Đang tải Dashboard Admin...
          </p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  return (
    <div className="admin-dashboard-page">
      <main className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-brand">
              THADS Barber
            </p>

            <h1>Admin Dashboard</h1>

            <p>
              Xin chào, {user.fullName}.
              Đây là tổng quan hoạt động của hệ thống.
            </p>
          </div>

          <div className="admin-dashboard-header-actions">
            <Link to="/">
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

        {error && (
          <div className="admin-dashboard-message admin-dashboard-error">
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
            <section className="admin-dashboard-date-banner">
              <div>
                <span>
                  Ngày hệ thống
                </span>

                <strong>
                  {formatDate(
                    dashboard.date
                  )}
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

            <section className="admin-dashboard-statistics admin-dashboard-statistics-primary">
              <article>
                <span>
                  Tổng người dùng
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .totalUsers
                  }
                </strong>
              </article>

              <article>
                <span>
                  Khách hàng
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .totalClients
                  }
                </strong>
              </article>

              <article>
                <span>
                  Barber
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .totalBarbers
                  }
                </strong>
              </article>

              <article>
                <span>
                  Dịch vụ đang hoạt động
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .totalServices
                  }
                </strong>
              </article>
            </section>

            <section className="admin-dashboard-revenue-grid">
              <article className="admin-dashboard-revenue-card admin-dashboard-revenue-today">
                <span>
                  Doanh thu hôm nay
                </span>

                <strong>
                  {formatPrice(
                    dashboard.statistics
                      .todayRevenue
                  )}
                  đ
                </strong>

                <small>
                  Từ lịch đã hoàn thành và thanh toán.
                </small>
              </article>

              <article className="admin-dashboard-revenue-card">
                <span>
                  Tổng doanh thu
                </span>

                <strong>
                  {formatPrice(
                    dashboard.statistics
                      .totalRevenue
                  )}
                  đ
                </strong>

                <small>
                  Tổng doanh thu đã ghi nhận.
                </small>
              </article>

              <article className="admin-dashboard-revenue-card">
                <span>
                  Lịch hôm nay
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .todayAppointments
                  }
                </strong>

                <small>
                  Tổng lịch hẹn trong ngày.
                </small>
              </article>
            </section>

            <section className="admin-dashboard-appointment-statistics">
              <article>
                <span>
                  Tổng lịch hẹn
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .totalAppointments
                  }
                </strong>
              </article>

              <article>
                <span>
                  Đang hoạt động
                </span>

                <strong>
                  {activeAppointmentCount}
                </strong>
              </article>

              <article>
                <span>
                  Chờ xác nhận
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .pendingAppointments
                  }
                </strong>
              </article>

              <article>
                <span>
                  Đã xác nhận
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .confirmedAppointments
                  }
                </strong>
              </article>

              <article>
                <span>
                  Đang thực hiện
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .inProgressAppointments
                  }
                </strong>
              </article>

              <article>
                <span>
                  Hoàn thành
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .completedAppointments
                  }
                </strong>
              </article>

              <article>
                <span>
                  Đã hủy
                </span>

                <strong>
                  {
                    dashboard.statistics
                      .cancelledAppointments
                  }
                </strong>
              </article>
            </section>

            <section className="admin-dashboard-main-grid">
              <article className="admin-dashboard-chart-card">
                <div className="admin-dashboard-section-heading">
                  <div>
                    <span>
                      Doanh thu 7 ngày
                    </span>

                    <h2>
                      Biểu đồ doanh thu
                    </h2>
                  </div>

                  <small>
                    Tỷ lệ hoàn thành:{" "}
                    {
                      appointmentCompletionRate
                    }
                    %
                  </small>
                </div>

                <div className="admin-dashboard-chart">
                  {dashboard.revenueLastSevenDays.map(
                    (point) => (
                      <div
                        className="admin-dashboard-chart-column"
                        key={point.date}
                      >
                        <div className="admin-dashboard-chart-value">
                          {formatPrice(
                            point.revenue
                          )}
                          đ
                        </div>

                        <div className="admin-dashboard-chart-track">
                          <div
                            className="admin-dashboard-chart-bar"
                            style={{
                              height: `${getChartHeight(
                                point,
                                maxRevenue
                              )}%`,
                            }}
                          />
                        </div>

                        <strong>
                          {formatDate(
                            point.date
                          ).slice(0, 5)}
                        </strong>

                        <small>
                          {
                            point.completedAppointments
                          }{" "}
                          lịch
                        </small>
                      </div>
                    )
                  )}
                </div>
              </article>

              <article className="admin-dashboard-progress-card">
                <div className="admin-dashboard-section-heading">
                  <div>
                    <span>
                      Hiệu suất hệ thống
                    </span>

                    <h2>
                      Tỷ lệ hoàn thành
                    </h2>
                  </div>
                </div>

                <div className="admin-dashboard-progress-circle">
                  <strong>
                    {
                      appointmentCompletionRate
                    }
                    %
                  </strong>

                  <span>
                    Lịch đã hoàn thành
                  </span>
                </div>

                <div className="admin-dashboard-progress-details">
                  <div>
                    <span>
                      Hoàn thành
                    </span>

                    <strong>
                      {
                        dashboard.statistics
                          .completedAppointments
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Đã hủy
                    </span>

                    <strong>
                      {
                        dashboard.statistics
                          .cancelledAppointments
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Đang xử lý
                    </span>

                    <strong>
                      {
                        activeAppointmentCount
                      }
                    </strong>
                  </div>
                </div>
              </article>
            </section>

            <section className="admin-dashboard-recent-section">
              <div className="admin-dashboard-section-heading">
                <div>
                  <span>
                    Hoạt động gần đây
                  </span>

                  <h2>
                    Lịch hẹn mới nhất
                  </h2>
                </div>
              </div>

              {dashboard.recentAppointments
                .length === 0 ? (
                <p className="admin-dashboard-empty">
                  Chưa có lịch hẹn nào.
                </p>
              ) : (
                <div className="admin-dashboard-table-wrapper">
                  <table className="admin-dashboard-table">
                    <thead>
                      <tr>
                        <th>
                          Khách hàng
                        </th>

                        <th>
                          Barber
                        </th>

                        <th>
                          Ngày hẹn
                        </th>

                        <th>
                          Khung giờ
                        </th>

                        <th>
                          Dịch vụ
                        </th>

                        <th>
                          Tổng tiền
                        </th>

                        <th>
                          Trạng thái
                        </th>

                        <th>
                          Thanh toán
                        </th>

                        <th>
                          Tạo lúc
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.recentAppointments.map(
                        (appointment) => (
                          <tr
                            key={
                              appointment._id
                            }
                          >
                            <td>
                              <strong>
                                {getUserName(
                                  appointment.client
                                )}
                              </strong>
                            </td>

                            <td>
                              {getUserName(
                                appointment.barber
                              )}
                            </td>

                            <td>
                              {formatDate(
                                appointment.appointmentDate
                              )}
                            </td>

                            <td>
                              {
                                appointment.startTime
                              }{" "}
                              -{" "}
                              {
                                appointment.endTime
                              }
                            </td>

                            <td>
                              <div className="admin-dashboard-services">
                                {appointment.services.map(
                                  (
                                    service,
                                    index
                                  ) => (
                                    <span
                                      key={`${service.nameSnapshot}-${index}`}
                                    >
                                      {
                                        service.nameSnapshot
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            </td>

                            <td>
                              <strong className="admin-dashboard-price">
                                {formatPrice(
                                  appointment.totalPrice
                                )}
                                đ
                              </strong>
                            </td>

                            <td>
                              <span
                                className={`admin-dashboard-status status-${appointment.status.toLowerCase()}`}
                              >
                                {
                                  appointmentStatusLabels[
                                    appointment
                                      .status
                                  ]
                                }
                              </span>
                            </td>

                            <td>
                              <span
                                className={`admin-dashboard-payment payment-${appointment.paymentStatus.toLowerCase()}`}
                              >
                                {
                                  paymentStatusLabels[
                                    appointment
                                      .paymentStatus
                                  ]
                                }
                              </span>
                            </td>

                            <td>
                              {formatDateTime(
                                appointment.createdAt
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-dashboard-shortcuts">
              <Link to="/">
                <span>
                  Trang chủ
                </span>

                <small>
                  Quay lại giao diện chính.
                </small>
              </Link>

              <Link to="/admin/dashboard">
                <span>
                  Làm mới Dashboard
                </span>

                <small>
                  Theo dõi dữ liệu mới nhất.
                </small>
              </Link>

              <Link to="/admin/appointments">
                <span>
                  Quản lý lịch hẹn
                </span>

                <small>
                  Xem và lọc toàn bộ lịch.
                </small>
              </Link>

              <Link to="/admin/users">
                <span>
                  Quản lý người dùng
                </span>

                <small>
                  Quản lý Client, Barber và Admin.
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