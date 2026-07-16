import axios from "axios";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { createAppointment } from "../../services/appointment.service";

import "./css/Booking.css";

type ServiceGroup =
  | "HAIRCUT"
  | "BEARD"
  | "COLOR"
  | null;

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  durationMinutes: number;
  exclusiveGroup: ServiceGroup;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "basic-haircut",
    name: "Cắt tóc cơ bản",
    price: 100000,
    priceLabel: "100.000đ",
    durationMinutes: 45,
    exclusiveGroup: "HAIRCUT",
  },
  {
    id: "fade-haircut",
    name: "Cắt Fade chuyên nghiệp",
    price: 130000,
    priceLabel: "130.000đ",
    durationMinutes: 60,
    exclusiveGroup: "HAIRCUT",
  },
  {
    id: "premium-haircut-combo",
    name: "Combo cắt tóc cao cấp",
    price: 180000,
    priceLabel: "180.000đ",
    durationMinutes: 90,
    exclusiveGroup: "HAIRCUT",
  },
  {
    id: "basic-beard-trim",
    name: "Tỉa râu cơ bản",
    price: 50000,
    priceLabel: "50.000đ",
    durationMinutes: 30,
    exclusiveGroup: "BEARD",
  },
  {
    id: "beard-lineup",
    name: "Tạo kiểu và viền râu",
    price: 80000,
    priceLabel: "80.000đ",
    durationMinutes: 45,
    exclusiveGroup: "BEARD",
  },
  {
    id: "beard-care-combo",
    name: "Combo chăm sóc râu",
    price: 120000,
    priceLabel: "120.000đ",
    durationMinutes: 60,
    exclusiveGroup: "BEARD",
  },
  {
    id: "hot-towel-shave",
    name: "Cạo mặt khăn nóng",
    price: 70000,
    priceLabel: "70.000đ",
    durationMinutes: 30,
    exclusiveGroup: null,
  },
  {
    id: "hair-wash-massage",
    name: "Gội đầu và massage",
    price: 60000,
    priceLabel: "60.000đ",
    durationMinutes: 30,
    exclusiveGroup: null,
  },
  {
    id: "basic-facial-care",
    name: "Chăm sóc da mặt cơ bản",
    price: 150000,
    priceLabel: "150.000đ",
    durationMinutes: 60,
    exclusiveGroup: null,
  },
  {
    id: "hair-perm",
    name: "Uốn tạo kiểu",
    price: 400000,
    priceLabel: "Từ 400.000đ",
    durationMinutes: 120,
    exclusiveGroup: null,
  },
  {
    id: "men-hair-color",
    name: "Nhuộm tóc nam",
    price: 350000,
    priceLabel: "Từ 350.000đ",
    durationMinutes: 90,
    exclusiveGroup: "COLOR",
  },
  {
    id: "bleach-fashion-color",
    name: "Tẩy và nhuộm thời trang",
    price: 650000,
    priceLabel: "Từ 650.000đ",
    durationMinutes: 180,
    exclusiveGroup: "COLOR",
  },
];

const barberOptions: string[] = [
  "Nguyễn Minh",
  "Đức Anh",
  "Thành Nam",
  "Hoàng Sơn",
];

const timeSlotOptions: string[] = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const getToday = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(today.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time: string): number => {
  const [hourText, minuteText] = time.split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return 0;
  }

  return hour * 60 + minute;
};

const minutesToTime = (
  totalMinutes: number
): string => {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(2, "0")}`;
};

const formatDuration = (
  totalMinutes: number
): string => {
  if (totalMinutes <= 0) {
    return "0 phút";
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

const getGroupErrorMessage = (
  group: Exclude<ServiceGroup, null>
): string => {
  if (group === "HAIRCUT") {
    return "Bạn chỉ được chọn một trong ba dịch vụ cắt tóc: cắt cơ bản, cắt Fade hoặc combo cắt tóc cao cấp.";
  }

  if (group === "BEARD") {
    return "Bạn chỉ được chọn một trong ba dịch vụ râu: tỉa râu cơ bản, tạo kiểu và viền râu hoặc combo chăm sóc râu.";
  }

  return "Bạn không thể chọn đồng thời nhuộm tóc nam và tẩy nhuộm thời trang.";
};

function Booking() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const [
    selectedServiceIds,
    setSelectedServiceIds,
  ] = useState<string[]>([]);

  const [barberName, setBarberName] =
    useState("");

  const [
    appointmentDate,
    setAppointmentDate,
  ] = useState("");

  const [timeSlot, setTimeSlot] =
    useState("");

  const [note, setNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const selectedServices = useMemo(() => {
    return serviceOptions.filter((service) =>
      selectedServiceIds.includes(service.id)
    );
  }, [selectedServiceIds]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce(
      (total, service) =>
        total + service.price,
      0
    );
  }, [selectedServices]);

  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce(
      (total, service) =>
        total + service.durationMinutes,
      0
    );
  }, [selectedServices]);

  const expectedEndTime = useMemo(() => {
    if (!timeSlot || totalDurationMinutes <= 0) {
      return "";
    }

    const startMinutes =
      timeToMinutes(timeSlot);

    return minutesToTime(
      startMinutes + totalDurationMinutes
    );
  }, [timeSlot, totalDurationMinutes]);

  const exceedsClosingTime = useMemo(() => {
    if (!timeSlot || totalDurationMinutes <= 0) {
      return false;
    }

    const startMinutes =
      timeToMinutes(timeSlot);

    const endMinutes =
      startMinutes + totalDurationMinutes;

    return endMinutes > timeToMinutes("21:00");
  }, [timeSlot, totalDurationMinutes]);

  const handleToggleService = (
    selectedService: ServiceOption
  ): void => {
    setSelectedServiceIds((currentIds) => {
      const isAlreadySelected =
        currentIds.includes(selectedService.id);

      if (isAlreadySelected) {
        setError("");
        setSuccess("");

        return currentIds.filter(
          (id) => id !== selectedService.id
        );
      }

      if (selectedService.exclusiveGroup) {
        const conflictingService =
          serviceOptions.find(
            (service) =>
              currentIds.includes(service.id) &&
              service.exclusiveGroup ===
                selectedService.exclusiveGroup
          );

        if (conflictingService) {
          setError(
            getGroupErrorMessage(
              selectedService.exclusiveGroup
            )
          );

          setSuccess("");

          return currentIds;
        }
      }

      setError("");
      setSuccess("");

      return [
        ...currentIds,
        selectedService.id,
      ];
    });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!isAuthenticated || !user) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Bạn cần đăng nhập trước khi đặt lịch.",
        },
      });

      return;
    }

    if (selectedServices.length === 0) {
      setError(
        "Vui lòng chọn ít nhất một dịch vụ."
      );
      return;
    }

    if (!barberName) {
      setError("Vui lòng chọn Barber.");
      return;
    }

    if (!appointmentDate) {
      setError("Vui lòng chọn ngày đặt lịch.");
      return;
    }

    if (!timeSlot) {
      setError("Vui lòng chọn khung giờ.");
      return;
    }

    if (exceedsClosingTime) {
      setError(
        `Các dịch vụ dự kiến kết thúc lúc ${expectedEndTime}, vượt quá giờ đóng cửa 21:00. Vui lòng chọn giờ sớm hơn.`
      );
      return;
    }

    try {
      setSubmitting(true);

      await createAppointment({
        services: selectedServices.map(
          (service) => ({
            name: service.name,
            price: service.price,
          })
        ),
        barberName,
        appointmentDate,
        timeSlot,
        note: note.trim(),
      });

      setSuccess("Đặt lịch thành công.");

      window.setTimeout(() => {
        navigate("/booking-history", {
          replace: true,
          state: {
            message:
              "Đặt lịch thành công. Lịch hẹn đang chờ xác nhận.",
          },
        });
      }, 700);
    } catch (requestError) {
      console.error(
        "Lỗi đặt lịch:",
        requestError
      );

      if (
        axios.isAxiosError(requestError)
      ) {
        const responseData =
          requestError.response?.data as
            | {
                message?: string;
              }
            | undefined;

        setError(
          responseData?.message ||
            "Không thể đặt lịch."
        );
      } else {
        setError(
          "Không thể kết nối đến máy chủ."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="booking-page">
        <div className="booking-card booking-auth-card">
          <p className="booking-loading">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="booking-page">
        <div className="booking-card booking-auth-card">
          <p className="booking-brand">
            THADS Barber
          </p>

          <h1 className="booking-title">
            Bạn chưa đăng nhập
          </h1>

          <p className="booking-subtitle">
            Vui lòng đăng nhập để sử dụng chức
            năng đặt lịch.
          </p>

          <Link
            className="booking-submit-button"
            to="/login"
          >
            Đăng nhập
          </Link>

          <Link
            className="booking-back-link"
            to="/"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-card">
        <div className="booking-heading">
          <p className="booking-brand">
            THADS Barber
          </p>

          <h1 className="booking-title">
            Đặt lịch cắt tóc
          </h1>

          <p className="booking-subtitle">
            Bạn có thể chọn nhiều dịch vụ, nhưng
            mỗi nhóm tương tự chỉ được chọn một
            dịch vụ.
          </p>
        </div>

        <div className="booking-user-info">
          <div>
            <span>Khách hàng</span>
            <strong>{user.fullName}</strong>
          </div>

          <div>
            <span>Số điện thoại</span>
            <strong>{user.phone}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >
          <div className="booking-field booking-services-field">
            <label>Chọn dịch vụ</label>

            <p className="booking-services-hint">
              Không thể chọn nhiều dịch vụ cắt tóc,
              nhiều dịch vụ râu hoặc đồng thời hai
              dịch vụ nhuộm trong một lịch hẹn.
            </p>

            <div className="booking-services-list">
              {serviceOptions.map((service) => {
                const checked =
                  selectedServiceIds.includes(
                    service.id
                  );

                const sameGroupSelected =
                  service.exclusiveGroup
                    ? selectedServices.some(
                        (selectedService) =>
                          selectedService.id !==
                            service.id &&
                          selectedService.exclusiveGroup ===
                            service.exclusiveGroup
                      )
                    : false;

                return (
                  <label
                    className={[
                      "booking-service-option",
                      checked ? "selected" : "",
                      sameGroupSelected
                        ? "booking-service-disabled"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={service.id}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={sameGroupSelected}
                      onChange={() =>
                        handleToggleService(service)
                      }
                    />

                    <span className="booking-service-check">
                      {checked ? "✓" : ""}
                    </span>

                    <span className="booking-service-info">
                      <strong>
                        {service.name}
                      </strong>

                      <small>
                        {service.priceLabel}
                      </small>

                      <small className="booking-service-duration">
                        Thời gian:{" "}
                        {formatDuration(
                          service.durationMinutes
                        )}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="booking-grid">
            <div className="booking-field">
              <label htmlFor="barberName">
                Barber
              </label>

              <select
                id="barberName"
                value={barberName}
                onChange={(event) => {
                  setBarberName(
                    event.target.value
                  );
                  setError("");
                }}
                required
              >
                <option value="">
                  Chọn Barber
                </option>

                {barberOptions.map((barber) => (
                  <option
                    key={barber}
                    value={barber}
                  >
                    {barber}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-field">
              <label htmlFor="appointmentDate">
                Ngày đặt lịch
              </label>

              <input
                id="appointmentDate"
                type="date"
                min={getToday()}
                value={appointmentDate}
                onChange={(event) => {
                  setAppointmentDate(
                    event.target.value
                  );
                  setError("");
                }}
                required
              />
            </div>

            <div className="booking-field">
              <label htmlFor="timeSlot">
                Khung giờ bắt đầu
              </label>

              <select
                id="timeSlot"
                value={timeSlot}
                onChange={(event) => {
                  setTimeSlot(
                    event.target.value
                  );
                  setError("");
                }}
                required
              >
                <option value="">
                  Chọn khung giờ
                </option>

                {timeSlotOptions.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="booking-summary booking-multi-summary">
              <div className="booking-selected-services">
                <span>Dịch vụ đã chọn</span>

                <ul>
                  {selectedServices.map(
                    (service) => (
                      <li key={service.id}>
                        <div>
                          <strong>
                            {service.name}
                          </strong>

                          <small>
                            {formatDuration(
                              service.durationMinutes
                            )}
                          </small>
                        </div>

                        <span>
                          {service.priceLabel}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="booking-total-price">
                <span>Tổng tiền dự kiến</span>

                <strong>
                  {formatPrice(totalPrice)}
                </strong>

                <span className="booking-summary-label">
                  Tổng thời gian
                </span>

                <strong className="booking-duration-value">
                  {formatDuration(
                    totalDurationMinutes
                  )}
                </strong>

                {timeSlot && expectedEndTime && (
                  <>
                    <span className="booking-summary-label">
                      Thời gian dự kiến
                    </span>

                    <strong
                      className={
                        exceedsClosingTime
                          ? "booking-end-time booking-end-time-error"
                          : "booking-end-time"
                      }
                    >
                      {timeSlot} - {expectedEndTime}
                    </strong>
                  </>
                )}

                <small>
                  Giá uốn, nhuộm hoặc tẩy là mức
                  giá tối thiểu và có thể thay đổi
                  sau khi Barber kiểm tra tóc.
                </small>
              </div>
            </div>
          )}

          {exceedsClosingTime && (
            <p className="booking-message booking-error">
              Lịch dự kiến kết thúc lúc{" "}
              {expectedEndTime}, vượt quá giờ đóng
              cửa 21:00. Vui lòng chọn khung giờ
              sớm hơn.
            </p>
          )}

          <div className="booking-field">
            <label htmlFor="note">
              Ghi chú
            </label>

            <textarea
              id="note"
              rows={4}
              maxLength={500}
              placeholder="Ví dụ: Tư vấn kiểu tóc, màu tóc hoặc yêu cầu khác..."
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
            />

            <small>
              {note.length}/500 ký tự
            </small>
          </div>

          {error && (
            <p className="booking-message booking-error">
              {error}
            </p>
          )}

          {success && (
            <p className="booking-message booking-success">
              {success}
            </p>
          )}

          <button
            className="booking-submit-button"
            type="submit"
            disabled={
              submitting || exceedsClosingTime
            }
          >
            {submitting
              ? "Đang đặt lịch..."
              : "Xác nhận đặt lịch"}
          </button>

          <div className="booking-bottom-links">
            <Link to="/booking-history">
              Xem lịch sử đặt lịch
            </Link>

            <Link to="/">
              Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;