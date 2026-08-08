import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getStaffNotifications,
  markAllStaffNotificationsRead,
  markStaffNotificationRead,
} from "../../services/staffNotification.service";
import type {
  StaffNotification,
  StaffNotificationKind,
} from "../../types/StaffNotification";

import "./css/StaffNotifications.css";

const kindLabels: Record<
  StaffNotificationKind,
  string
> = {
  NEW_APPOINTMENT: "Lịch mới",
  UPCOMING: "Sắp tới",
  NO_SHOW: "Vắng mặt",
  WAITING_PAYMENT: "Chờ thanh toán",
  APPOINTMENT_CHANGED: "Thay đổi lịch",
  PAYMENT: "Thanh toán",
};

const getError = (error: unknown) =>
  axios.isAxiosError(error)
    ? (
        error.response?.data as
          | { message?: string }
          | undefined
      )?.message || "Có lỗi xảy ra"
    : "Có lỗi xảy ra";

function StaffNotifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const isReceptionist =
    location.pathname.startsWith(
      "/receptionist"
    );
  const [items, setItems] = useState<
    StaffNotification[]
  >([]);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [unreadOnly, setUnreadOnly] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response =
        await getStaffNotifications(
          unreadOnly
        );
      setItems(response.items);
      setUnreadCount(
        response.unreadCount
      );
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNotification = async (
    notification: StaffNotification
  ) => {
    if (!notification.isRead) {
      await markStaffNotificationRead(
        notification._id
      );
    }
    const appointmentId =
      typeof notification.appointment === "string"
        ? notification.appointment
        : notification.appointment?._id;
    const basePath = isReceptionist
      ? "/receptionist/dashboard"
      : "/admin/appointments";

    navigate(
      appointmentId
        ? `${basePath}?appointmentId=${encodeURIComponent(appointmentId)}`
        : basePath
    );
  };

  const readAll = async () => {
    try {
      await markAllStaffNotificationsRead();
      await load();
    } catch (requestError) {
      setError(getError(requestError));
    }
  };

  return (
    <div className="staff-notifications-page">
      <header>
        <div>
          <p>THADS BARBER</p>
          <h1>Trung tâm thông báo</h1>
          <span>
            Theo dõi lịch mới, lịch sắp tới
            và các công việc cần xử lý.
          </span>
        </div>
        <button
          type="button"
          disabled={unreadCount === 0}
          onClick={() => void readAll()}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </header>

      <div className="staff-notification-toolbar">
        <label>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) =>
              setUnreadOnly(
                event.target.checked
              )
            }
          />
          Chỉ hiển thị chưa đọc
        </label>
        <span>
          {unreadCount} thông báo chưa đọc
        </span>
      </div>

      {error && (
        <div className="staff-notification-error">
          {error}
        </div>
      )}

      <section className="staff-notification-list">
        {loading ? (
          <p className="staff-notification-empty">
            Đang tải thông báo...
          </p>
        ) : items.length === 0 ? (
          <p className="staff-notification-empty">
            Không có thông báo phù hợp.
          </p>
        ) : (
          items.map((notification) => (
            <button
              type="button"
              key={notification._id}
              className={`staff-notification-card ${
                notification.isRead
                  ? "is-read"
                  : "is-unread"
              }`}
              onClick={() =>
                void openNotification(
                  notification
                )
              }
            >
              <span
                className={`staff-notification-kind kind-${notification.kind.toLowerCase()}`}
              >
                {kindLabels[notification.kind]}
              </span>
              <div>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                <small>
                  {new Intl.DateTimeFormat(
                    "vi-VN",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  ).format(
                    new Date(
                      notification.createdAt
                    )
                  )}
                </small>
              </div>
              {!notification.isRead && (
                <i title="Chưa đọc" />
              )}
            </button>
          ))
        )}
      </section>
    </div>
  );
}

export default StaffNotifications;
