import axios from "axios";
import { useEffect, useMemo, useState,type FormEvent,} from "react";
import { Link, useNavigate,} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { createAppointment, getAvailableSlots, type AvailableSlot,} from "../../services/appointment.service";
import { getCatalogBarbers, getCatalogServices,} from "../../services/catalog.service";
import type { CatalogBarber, CatalogService, ServiceGroup,} from "../../types/Catalog";
import "./css/Booking.css";

interface ServiceGroupSection {
  group: ServiceGroup;
  title: string;
  description: string;
}

const serviceGroupSections: ServiceGroupSection[] = [
  {
    group: "HAIRCUT",
    title: "Cắt tóc",
    description:
      "Chỉ chọn một dịch vụ cắt tóc trong cùng lịch hẹn.",
  },
  {
    group: "BEARD",
    title: "Chăm sóc râu",
    description:
      "Chỉ chọn một dịch vụ chăm sóc râu trong cùng lịch hẹn.",
  },
  {
    group: "CARE",
    title: "Chăm sóc thư giãn",
    description:
      "Có thể kết hợp nhiều dịch vụ chăm sóc.",
  },
  {
    group: "COLOR",
    title: "Nhuộm tóc",
    description:
      "Chỉ chọn một dịch vụ nhuộm trong cùng lịch hẹn.",
  },
  {
    group: "OTHER",
    title: "Dịch vụ khác",
    description:
      "Các dịch vụ tạo kiểu và bổ sung.",
  },
];

const formatPrice = (price: number): string =>new Intl.NumberFormat("vi-VN").format(price);

const formatDuration = ( totalMinutes: number ): string => {
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

const formatDateForDisplay = ( dateValue: string ): string => {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
};

const getToday = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String( today.getMonth() + 1 ).padStart(2, "0");
  const day = String( today.getDate() ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getErrorMessage = (error: unknown,fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as | {message?: string;} | undefined;

    return responseData?.message || fallback;
  }

  return fallback;
};

function Booking() {
  const navigate = useNavigate();

  const {user,isAuthenticated,isLoading: authLoading,} = useAuth();

  const [catalogServices, setCatalogServices,] = useState<CatalogService[]>([]);

  const [catalogBarbers,setCatalogBarbers,] = useState<CatalogBarber[]>([]);

  const [selectedServiceIds,setSelectedServiceIds,] = useState<string[]>([]);

  const [barberId, setBarberId] = useState("");

  const [appointmentDate,setAppointmentDate,] = useState("");

  const [startTime, setStartTime] = useState("");

  const [note, setNote] = useState("");

  const [availableSlots, setAvailableSlots,] = useState<AvailableSlot[]>([]);

  const [catalogLoading,setCatalogLoading,] = useState(true);

  const [slotsLoading, setSlotsLoading,] = useState(false);

  const [submitting,setSubmitting,] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => { let active = true;

    const loadCatalog = async (): Promise<void> => {
      try {
        setCatalogLoading(true);
        setError("");

        const [servicesResponse,barbersResponse,] = await Promise.all([
          getCatalogServices(),
          getCatalogBarbers(),
        ]);

        if (!active) {
          return;
        }

        setCatalogServices(
          servicesResponse.services
        );

        setCatalogBarbers(
          barbersResponse.barbers
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          getErrorMessage(
            requestError,
            "Không thể tải danh sách dịch vụ và Barber."
          )
        );
      } finally {
        if (active) {
          setCatalogLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (
      !barberId ||
      !appointmentDate ||
      selectedServiceIds.length === 0
    ) {
      setAvailableSlots([]);
      setStartTime("");
      return;
    }

    const loadAvailableSlots =
      async (): Promise<void> => {
        try {
          setSlotsLoading(true);
          setError("");
          setStartTime("");

          const response =
            await getAvailableSlots(
              barberId,
              selectedServiceIds,
              appointmentDate
            );

          if (!active) {
            return;
          }

          setAvailableSlots(
            response.slots
          );
        } catch (requestError) {
          if (!active) {
            return;
          }

          setAvailableSlots([]);

          setError(
            getErrorMessage(
              requestError,
              "Không thể tải khung giờ trống."
            )
          );
        } finally {
          if (active) {
            setSlotsLoading(false);
          }
        }
      };

    void loadAvailableSlots();

    return () => {
      active = false;
    };
  }, [
    barberId,
    appointmentDate,
    selectedServiceIds,
  ]);

  const selectedServices = useMemo(
    () =>
      catalogServices.filter(
        (service) =>
          selectedServiceIds.includes(
            service.id
          )
      ),
    [
      catalogServices,
      selectedServiceIds,
    ]
  );

  const selectedBarber = useMemo(
    () =>
      catalogBarbers.find(
        (barber) =>
          barber.id === barberId
      ) ?? null,
    [catalogBarbers, barberId]
  );

  const groupedServices = useMemo(
    () =>
      serviceGroupSections.map(
        (section) => ({
          ...section,
          services:
            catalogServices.filter(
              (service) =>
                service.group ===
                section.group
            ),
        })
      ),
    [catalogServices]
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (sum, service) =>
          sum + service.price,
        0
      ),
    [selectedServices]
  );

  const totalDurationMinutes = useMemo(
    () =>
      selectedServices.reduce(
        (sum, service) =>
          sum +
          service.durationMinutes,
        0
      ),
    [selectedServices]
  );

  const selectedSlot = useMemo(
    () =>
      availableSlots.find(
        (slot) =>
          slot.startTime === startTime
      ) ?? null,
    [availableSlots, startTime]
  );

  const isServiceSelected = (
    serviceId: string
  ): boolean =>
    selectedServiceIds.includes(
      serviceId
    );

  const isServiceDisabled = (
    service: CatalogService
  ): boolean => {
    if (
      !service.isExclusiveInGroup ||
      isServiceSelected(service.id)
    ) {
      return false;
    }

    return selectedServices.some(
      (selectedService) =>
        selectedService.group ===
          service.group &&
        selectedService.isExclusiveInGroup
    );
  };

  const handleToggleService = (
    service: CatalogService
  ): void => {
    setError("");
    setSuccess("");
    setStartTime("");

    setSelectedServiceIds(
      (currentIds) => {
        if (
          currentIds.includes(
            service.id
          )
        ) {
          return currentIds.filter(
            (id) => id !== service.id
          );
        }

        if (
          service.isExclusiveInGroup
        ) {
          const filteredIds =
            currentIds.filter((id) => {
              const currentService =
                catalogServices.find(
                  (item) =>
                    item.id === id
                );

              return !(
                currentService &&
                currentService.group ===
                  service.group &&
                currentService.isExclusiveInGroup
              );
            });

          return [
            ...filteredIds,
            service.id,
          ];
        }

        return [
          ...currentIds,
          service.id,
        ];
      }
    );
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

    if (!barberId) {
      setError(
        "Vui lòng chọn Barber."
      );
      return;
    }

    if (
      selectedServiceIds.length === 0
    ) {
      setError(
        "Vui lòng chọn ít nhất một dịch vụ."
      );
      return;
    }

    if (!appointmentDate) {
      setError(
        "Vui lòng chọn ngày đặt lịch."
      );
      return;
    }

    if (!startTime) {
      setError(
        "Vui lòng chọn khung giờ."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createAppointment({
          barberId,
          serviceIds:
            selectedServiceIds,
          appointmentDate,
          startTime,
          note: note.trim(),
        });

      setSuccess(response.message);

      window.setTimeout(() => {
        navigate(
          "/booking-history",
          {
            replace: true,
            state: {
              message:
                "Đặt lịch thành công. Lịch hẹn đang chờ xác nhận.",
            },
          }
        );
      }, 700);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể đặt lịch."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="booking-page">
        <div className="booking-card booking-state-card">
          <div className="booking-spinner" />
          <p>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="booking-page">
        <div className="booking-card booking-state-card">
          <p className="booking-brand">
            THADS Barber
          </p>

          <h1 className="booking-title">
            Bạn chưa đăng nhập
          </h1>

          <p className="booking-subtitle">
            Vui lòng đăng nhập để sử dụng chức năng đặt lịch.
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
      <main className="booking-card">
        <header className="booking-heading">
          <p className="booking-brand">
            THADS Barber
          </p>

          <h1 className="booking-title">
            Đặt lịch dịch vụ
          </h1>

          <p className="booking-subtitle">
            Chọn Barber, dịch vụ, ngày và khung giờ còn trống.
          </p>
        </header>

        <section className="booking-user-info">
          <div>
            <span>Khách hàng</span>
            <strong>{user.fullName}</strong>
          </div>

          <div>
            <span>Số điện thoại</span>
            <strong>
              {user.phone || "Chưa cập nhật"}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
        </section>

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

        {catalogLoading ? (
          <section className="booking-loading-panel">
            <div className="booking-spinner" />
            <p>
              Đang tải danh sách dịch vụ và Barber...
            </p>
          </section>
        ) : (
          <form
            className="booking-form"
            onSubmit={handleSubmit}
          >
            <section className="booking-section">
              <div className="booking-section-heading">
                <div>
                  <span className="booking-step">
                    Bước 1
                  </span>
                  <h2>Chọn Barber</h2>
                </div>

                <small>
                  {catalogBarbers.length} Barber đang hoạt động
                </small>
              </div>

              {catalogBarbers.length === 0 ? (
                <p className="booking-empty-text">
                  Chưa có Barber đang hoạt động.
                </p>
              ) : (
                <div className="booking-barber-list">
                  {catalogBarbers.map(
                    (barber) => {
                      const selected =
                        barber.id ===
                        barberId;

                      return (
                        <button
                          key={barber.id}
                          type="button"
                          className={`booking-barber-card ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setBarberId(
                              barber.id
                            );
                            setStartTime("");
                            setError("");
                            setSuccess("");
                          }}
                        >
                          <div className="booking-barber-avatar">
                            {barber.profile
                              .avatar ? (
                              <img
                                src={
                                  barber
                                    .profile
                                    .avatar
                                }
                                alt={
                                  barber.fullName
                                }
                              />
                            ) : (
                              <span>
                                {barber.fullName
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="booking-barber-info">
                            <strong>
                              {barber.fullName}
                            </strong>

                            <span>
                              {
                                barber.profile
                                  .experienceYears
                              }{" "}
                              năm kinh nghiệm
                            </span>

                            <small>
                              Đánh giá:{" "}
                              {barber.profile
                                .averageRating >
                              0
                                ? barber.profile.averageRating.toFixed(
                                    1
                                  )
                                : "Chưa có"}
                            </small>
                          </div>

                          <span className="booking-barber-check">
                            {selected
                              ? "✓"
                              : ""}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {selectedBarber && (
                <div className="booking-selected-barber">
                  <strong>
                    Đã chọn:{" "}
                    {
                      selectedBarber.fullName
                    }
                  </strong>

                  {selectedBarber.profile
                    .bio && (
                    <p>
                      {
                        selectedBarber
                          .profile.bio
                      }
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <div>
                  <span className="booking-step">
                    Bước 2
                  </span>
                  <h2>Chọn dịch vụ</h2>
                </div>

                <small>
                  Đã chọn{" "}
                  {
                    selectedServiceIds.length
                  }{" "}
                  dịch vụ
                </small>
              </div>

              <p className="booking-services-hint">
                Bạn có thể chọn nhiều dịch vụ. Trong các nhóm độc quyền,
                dịch vụ mới sẽ thay thế dịch vụ đã chọn trước đó.
              </p>

              {groupedServices.map(
                (section) => {
                  if (
                    section.services
                      .length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      className="booking-service-group"
                      key={
                        section.group
                      }
                    >
                      <div className="booking-service-group-heading">
                        <h3>
                          {section.title}
                        </h3>
                        <p>
                          {
                            section.description
                          }
                        </p>
                      </div>

                      <div className="booking-services-list">
                        {section.services.map(
                          (service) => {
                            const selected =
                              isServiceSelected(
                                service.id
                              );

                            const disabled =
                              isServiceDisabled(
                                service
                              );

                            return (
                              <button
                                type="button"
                                key={
                                  service.id
                                }
                                disabled={
                                  disabled
                                }
                                className={[
                                  "booking-service-option",
                                  selected
                                    ? "selected"
                                    : "",
                                  disabled
                                    ? "disabled"
                                    : "",
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(" ")}
                                onClick={() =>
                                  handleToggleService(
                                    service
                                  )
                                }
                              >
                                <span className="booking-service-check">
                                  {selected
                                    ? "✓"
                                    : ""}
                                </span>

                                <span className="booking-service-info">
                                  <strong>
                                    {
                                      service.name
                                    }
                                  </strong>

                                  {service.description && (
                                    <span className="booking-service-description">
                                      {
                                        service.description
                                      }
                                    </span>
                                  )}

                                  <span className="booking-service-meta">
                                    <small>
                                      {service.priceFrom
                                        ? "Từ "
                                        : ""}
                                      {formatPrice(
                                        service.price
                                      )}
                                      đ
                                    </small>

                                    <small>
                                      {formatDuration(
                                        service.durationMinutes
                                      )}
                                    </small>
                                  </span>
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <div>
                  <span className="booking-step">
                    Bước 3
                  </span>
                  <h2>Chọn ngày</h2>
                </div>
              </div>

              <div className="booking-grid">
                <div className="booking-field">
                  <label htmlFor="appointmentDate">
                    Ngày đặt lịch
                  </label>

                  <input
                    id="appointmentDate"
                    type="date"
                    min={getToday()}
                    value={
                      appointmentDate
                    }
                    onChange={(
                      event
                    ) => {
                      setAppointmentDate(
                        event.target
                          .value
                      );
                      setStartTime("");
                      setError("");
                      setSuccess("");
                    }}
                  />
                </div>

                <div className="booking-field">
                  <label>
                    Barber đã chọn
                  </label>

                  <div className="booking-readonly-field">
                    {selectedBarber
                      ? selectedBarber.fullName
                      : "Chưa chọn Barber"}
                  </div>
                </div>

                <div className="booking-field">
                  <label>
                    Tổng thời gian
                  </label>

                  <div className="booking-readonly-field">
                    {selectedServices.length >
                    0
                      ? formatDuration(
                          totalDurationMinutes
                        )
                      : "Chưa chọn dịch vụ"}
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <div>
                  <span className="booking-step">
                    Bước 4
                  </span>
                  <h2>Chọn khung giờ</h2>
                </div>

                <small>
                  Khung giờ được tính theo tổng thời lượng dịch vụ
                </small>
              </div>

              {!barberId ? (
                <p className="booking-empty-text">
                  Vui lòng chọn Barber trước.
                </p>
              ) : selectedServiceIds.length ===
                0 ? (
                <p className="booking-empty-text">
                  Vui lòng chọn ít nhất một dịch vụ.
                </p>
              ) : !appointmentDate ? (
                <p className="booking-empty-text">
                  Vui lòng chọn ngày đặt lịch.
                </p>
              ) : slotsLoading ? (
                <div className="booking-slots-loading">
                  <div className="booking-spinner" />
                  <span>
                    Đang tìm khung giờ trống...
                  </span>
                </div>
              ) : availableSlots.length ===
                0 ? (
                <p className="booking-empty-text">
                  Không còn khung giờ phù hợp. Hãy chọn ngày hoặc Barber khác.
                </p>
              ) : (
                <div className="booking-time-slots">
                  {availableSlots.map(
                    (slot) => {
                      const selected =
                        startTime ===
                        slot.startTime;

                      return (
                        <button
                          key={`${slot.startTime}-${slot.endTime}`}
                          type="button"
                          className={`booking-time-slot ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setStartTime(
                              slot.startTime
                            );
                            setError("");
                            setSuccess("");
                          }}
                        >
                          <strong>
                            {
                              slot.startTime
                            }
                          </strong>

                          <span>
                            đến{" "}
                            {
                              slot.endTime
                            }
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <div>
                  <span className="booking-step">
                    Bước 5
                  </span>
                  <h2>Ghi chú</h2>
                </div>
              </div>

              <div className="booking-field">
                <label htmlFor="note">
                  Yêu cầu thêm
                </label>

                <textarea
                  id="note"
                  rows={4}
                  maxLength={500}
                  value={note}
                  placeholder="Ví dụ: Tư vấn màu tóc, kiểu tóc hoặc yêu cầu khác..."
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                />

                <small>
                  {note.length}/500 ký tự
                </small>
              </div>
            </section>

            {selectedServices.length >
              0 && (
              <section className="booking-summary">
                <div className="booking-selected-services">
                  <span>
                    Dịch vụ đã chọn
                  </span>

                  <ul>
                    {selectedServices.map(
                      (service) => (
                        <li
                          key={
                            service.id
                          }
                        >
                          <div>
                            <strong>
                              {
                                service.name
                              }
                            </strong>
                            <small>
                              {formatDuration(
                                service.durationMinutes
                              )}
                            </small>
                          </div>

                          <span>
                            {service.priceFrom
                              ? "Từ "
                              : ""}
                            {formatPrice(
                              service.price
                            )}
                            đ
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="booking-total-price">
                  <span>
                    Tổng tiền dự kiến
                  </span>

                  <strong>
                    {formatPrice(
                      totalPrice
                    )}
                    đ
                  </strong>

                  <span className="booking-summary-label">
                    Tổng thời gian
                  </span>

                  <strong className="booking-summary-value">
                    {formatDuration(
                      totalDurationMinutes
                    )}
                  </strong>

                  {selectedBarber && (
                    <>
                      <span className="booking-summary-label">
                        Barber
                      </span>
                      <strong className="booking-summary-value">
                        {
                          selectedBarber.fullName
                        }
                      </strong>
                    </>
                  )}

                  {appointmentDate && (
                    <>
                      <span className="booking-summary-label">
                        Ngày hẹn
                      </span>
                      <strong className="booking-summary-value">
                        {formatDateForDisplay(
                          appointmentDate
                        )}
                      </strong>
                    </>
                  )}

                  {selectedSlot && (
                    <>
                      <span className="booking-summary-label">
                        Khung giờ
                      </span>
                      <strong className="booking-summary-value">
                        {
                          selectedSlot.startTime
                        }{" "}
                        -{" "}
                        {
                          selectedSlot.endTime
                        }
                      </strong>
                    </>
                  )}

                  <small>
                    Giá có chữ “Từ” có thể thay đổi sau khi Barber kiểm tra tình trạng tóc.
                  </small>
                </div>
              </section>
            )}

            <button
              type="submit"
              className="booking-submit-button"
              disabled={
                submitting ||
                !barberId ||
                selectedServiceIds.length ===
                  0 ||
                !appointmentDate ||
                !startTime
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
        )}
      </main>
    </div>
  );
}

export default Booking;