import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  getMyBarberSchedule,
  updateMyWeeklySchedule,
} from "../../services/baberSchedule.service";

import type {
  BarberScheduleDay,
  ScheduleBreak,
} from "../../types/BarberSchedule";

import "./css/WorkingSchedule.css";

const dayLabels: Record<number, string> = {
  0: "Chủ Nhật",
  1: "Thứ Hai",
  2: "Thứ Ba",
  3: "Thứ Tư",
  4: "Thứ Năm",
  5: "Thứ Sáu",
  6: "Thứ Bảy",
};

const createDefaultSchedule = (
  dayOfWeek: number
): BarberScheduleDay => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "21:00",
  breaks:
    dayOfWeek === 0
      ? []
      : [
          {
            startTime: "12:00",
            endTime: "13:00",
          },
        ],
  isWorking: dayOfWeek !== 0,
});

const normalizeSchedules = (
  schedules: BarberScheduleDay[]
): BarberScheduleDay[] => {
  const scheduleMap = new Map(
    schedules.map((schedule) => [
      schedule.dayOfWeek,
      schedule,
    ])
  );

  return Array.from(
    { length: 7 },
    (_, dayOfWeek) => {
      const schedule =
        scheduleMap.get(dayOfWeek);

      if (!schedule) {
        return createDefaultSchedule(
          dayOfWeek
        );
      }

      return {
        ...schedule,
        breaks: Array.isArray(
          schedule.breaks
        )
          ? schedule.breaks
          : [],
      };
    }
  );
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

function WorkingSchedule() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [
    schedules,
    setSchedules,
  ] = useState<BarberScheduleDay[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadSchedule =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyBarberSchedule();

        setSchedules(
          normalizeSchedules(
            response.schedules
          )
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải lịch làm việc."
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

    void loadSchedule();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadSchedule,
  ]);

  const updateScheduleDay = (
    dayOfWeek: number,
    changes: Partial<BarberScheduleDay>
  ): void => {
    setSchedules(
      (currentSchedules) =>
        currentSchedules.map(
          (schedule) =>
            schedule.dayOfWeek ===
            dayOfWeek
              ? {
                  ...schedule,
                  ...changes,
                }
              : schedule
        )
    );

    setError("");
    setMessage("");
  };

  const updateBreak = (
    dayOfWeek: number,
    breakIndex: number,
    changes: Partial<ScheduleBreak>
  ): void => {
    setSchedules(
      (currentSchedules) =>
        currentSchedules.map(
          (schedule) => {
            if (
              schedule.dayOfWeek !==
              dayOfWeek
            ) {
              return schedule;
            }

            const updatedBreaks =
              schedule.breaks.map(
                (
                  breakItem,
                  currentIndex
                ) =>
                  currentIndex ===
                  breakIndex
                    ? {
                        ...breakItem,
                        ...changes,
                      }
                    : breakItem
              );

            return {
              ...schedule,
              breaks: updatedBreaks,
            };
          }
        )
    );

    setError("");
    setMessage("");
  };

  const addBreak = (
    dayOfWeek: number
  ): void => {
    setSchedules(
      (currentSchedules) =>
        currentSchedules.map(
          (schedule) =>
            schedule.dayOfWeek ===
            dayOfWeek
              ? {
                  ...schedule,
                  breaks: [
                    ...schedule.breaks,
                    {
                      startTime:
                        "12:00",
                      endTime:
                        "13:00",
                    },
                  ],
                }
              : schedule
        )
    );
  };

  const removeBreak = (
    dayOfWeek: number,
    breakIndex: number
  ): void => {
    setSchedules(
      (currentSchedules) =>
        currentSchedules.map(
          (schedule) =>
            schedule.dayOfWeek ===
            dayOfWeek
              ? {
                  ...schedule,
                  breaks:
                    schedule.breaks.filter(
                      (
                        _breakItem,
                        currentIndex
                      ) =>
                        currentIndex !==
                        breakIndex
                    ),
                }
              : schedule
        )
    );
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload =
        schedules.map((schedule) => ({
          dayOfWeek:
            schedule.dayOfWeek,

          startTime:
            schedule.startTime,

          endTime:
            schedule.endTime,

          breaks:
            schedule.isWorking
              ? schedule.breaks
              : [],

          isWorking:
            schedule.isWorking,
        }));

      const response =
        await updateMyWeeklySchedule(
          payload
        );

      setSchedules(
        normalizeSchedules(
          response.schedules
        )
      );

      setMessage(response.message);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể lưu lịch làm việc."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="working-schedule-page">
        <div className="working-schedule-loading">
          Đang tải lịch làm việc...
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
    <div className="working-schedule-page">
      <main className="working-schedule-container">
        <header className="working-schedule-header">
          <div>
            <p className="working-schedule-brand">
              THADS Barber
            </p>

            <h1>
              Quản lý lịch làm việc
            </h1>

            <p>
              Thiết lập ngày làm, giờ làm và
              các khoảng nghỉ trong tuần.
            </p>
          </div>

          <div className="working-schedule-actions">
            <Link to="/barber/schedule">
              Lịch hẹn
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void handleSave()
              }
            >
              {saving
                ? "Đang lưu..."
                : "Lưu lịch làm việc"}
            </button>
          </div>
        </header>

        {message && (
          <p className="working-schedule-message working-schedule-success">
            {message}
          </p>
        )}

        {error && (
          <p className="working-schedule-message working-schedule-error">
            {error}
          </p>
        )}

        <section className="working-schedule-list">
          {schedules.map(
            (schedule) => (
              <article
                key={schedule.dayOfWeek}
                className={`working-schedule-card ${
                  schedule.isWorking
                    ? ""
                    : "day-off"
                }`}
              >
                <div className="working-schedule-day">
                  <div>
                    <h2>
                      {
                        dayLabels[
                          schedule.dayOfWeek
                        ]
                      }
                    </h2>

                    <span>
                      {schedule.isWorking
                        ? "Đang làm việc"
                        : "Ngày nghỉ"}
                    </span>
                  </div>

                  <label className="working-schedule-switch">
                    <input
                      type="checkbox"
                      checked={
                        schedule.isWorking
                      }
                      onChange={(
                        event
                      ) =>
                        updateScheduleDay(
                          schedule.dayOfWeek,
                          {
                            isWorking:
                              event.target
                                .checked,
                          }
                        )
                      }
                    />

                    <span />
                  </label>
                </div>

                <div className="working-schedule-time-grid">
                  <div className="working-schedule-field">
                    <label>
                      Giờ bắt đầu
                    </label>

                    <input
                      type="time"
                      value={
                        schedule.startTime
                      }
                      disabled={
                        !schedule.isWorking
                      }
                      onChange={(
                        event
                      ) =>
                        updateScheduleDay(
                          schedule.dayOfWeek,
                          {
                            startTime:
                              event.target
                                .value,
                          }
                        )
                      }
                    />
                  </div>

                  <div className="working-schedule-field">
                    <label>
                      Giờ kết thúc
                    </label>

                    <input
                      type="time"
                      value={
                        schedule.endTime
                      }
                      disabled={
                        !schedule.isWorking
                      }
                      onChange={(
                        event
                      ) =>
                        updateScheduleDay(
                          schedule.dayOfWeek,
                          {
                            endTime:
                              event.target
                                .value,
                          }
                        )
                      }
                    />
                  </div>
                </div>

                <div className="working-schedule-breaks">
                  <div className="working-schedule-break-heading">
                    <div>
                      <h3>
                        Khoảng nghỉ
                      </h3>

                      <p>
                        Khách hàng không thể đặt
                        lịch trong các khoảng này.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !schedule.isWorking
                      }
                      onClick={() =>
                        addBreak(
                          schedule.dayOfWeek
                        )
                      }
                    >
                      Thêm giờ nghỉ
                    </button>
                  </div>

                  {!schedule.isWorking ? (
                    <p className="working-schedule-empty">
                      Ngày này đang được đặt là
                      ngày nghỉ.
                    </p>
                  ) : schedule.breaks.length ===
                    0 ? (
                    <p className="working-schedule-empty">
                      Chưa có khoảng nghỉ.
                    </p>
                  ) : (
                    <div className="working-schedule-break-list">
                      {schedule.breaks.map(
                        (
                          breakItem,
                          breakIndex
                        ) => (
                          <div
                            className="working-schedule-break-row"
                            key={`${schedule.dayOfWeek}-${breakIndex}`}
                          >
                            <input
                              type="time"
                              value={
                                breakItem.startTime
                              }
                              onChange={(
                                event
                              ) =>
                                updateBreak(
                                  schedule.dayOfWeek,
                                  breakIndex,
                                  {
                                    startTime:
                                      event.target
                                        .value,
                                  }
                                )
                              }
                            />

                            <span>đến</span>

                            <input
                              type="time"
                              value={
                                breakItem.endTime
                              }
                              onChange={(
                                event
                              ) =>
                                updateBreak(
                                  schedule.dayOfWeek,
                                  breakIndex,
                                  {
                                    endTime:
                                      event.target
                                        .value,
                                  }
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeBreak(
                                  schedule.dayOfWeek,
                                  breakIndex
                                )
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          )}
        </section>

        <footer className="working-schedule-footer">
          <Link to="/barber/schedule">
            Quay lại lịch hẹn
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void handleSave()
            }
          >
            {saving
              ? "Đang lưu..."
              : "Lưu thay đổi"}
          </button>
        </footer>
      </main>
    </div>
  );
}

export default WorkingSchedule;