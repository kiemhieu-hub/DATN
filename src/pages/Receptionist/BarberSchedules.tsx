import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import {
  getReceptionBarberDayDetail,
  getReceptionBarberSchedules,
  getReceptionScheduleHistory,
  removeReceptionDateOverride,
  saveReceptionBarberSchedule,
  saveReceptionDateOverride,
  type ReceptionBarberSchedule,
  type ScheduleChangeHistoryItem,
} from "../../services/receptionist.service";
import type { BarberScheduleDay } from "../../types/BarberSchedule";

import StaffMultiSelect from "./StaffMultiSelect";
import "./Receptionist.css";

const dayNames = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

type DateDraft = {
  date: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  note: string;
  source?: "WEEKLY" | "OVERRIDE";
};

const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

const createDefaultDraft = (): DateDraft => ({
  date: getLocalDate(),
  startTime: "09:00",
  endTime: "21:00",
  isWorking: true,
  note: "",
});

const normalizeSchedules = (values: BarberScheduleDay[]) =>
  Array.from({ length: 7 }, (_, dayOfWeek) =>
    values.find((value) => value.dayOfWeek === dayOfWeek) ?? {
      dayOfWeek,
      startTime: "09:00",
      endTime: "21:00",
      isWorking: dayOfWeek !== 0,
      breaks: [],
    }
  );

function BarberSchedules() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { user, isAuthenticated, isLoading } = useAuth(
    isAdmin ? "ADMIN" : "RECEPTIONIST"
  );

  const [items, setItems] = useState<ReceptionBarberSchedule[]>([]);
  const [selectedHairIds, setSelectedHairIds] = useState<string[]>([]);
  const [selectedCareIds, setSelectedCareIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DateDraft>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [historyBarber, setHistoryBarber] = useState<
    ReceptionBarberSchedule["barber"] | null
  >(null);
  const [historyItems, setHistoryItems] = useState<
    ScheduleChangeHistoryItem[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      navigate(isAdmin ? "/admin/login" : "/receptionist/login");
      return;
    }

    getReceptionBarberSchedules()
      .then(({ items: responseItems }) => {
        const normalizedItems = responseItems.map((item) => ({
          ...item,
          schedules: normalizeSchedules(item.schedules),
        }));

        setItems(normalizedItems);
        setSelectedHairIds(
          normalizedItems
            .filter((item) => item.barber.staffType !== "CARE")
            .map((item) => item.barber._id)
        );
        setSelectedCareIds(
          normalizedItems
            .filter((item) => item.barber.staffType === "CARE")
            .map((item) => item.barber._id)
        );
        setDrafts(
          Object.fromEntries(
            normalizedItems.map((item) => [item.barber._id, createDefaultDraft()])
          )
        );
      })
      .catch(() => setError("Không thể tải lịch nhân viên"));
  }, [isLoading, isAuthenticated, user, navigate, isAdmin]);

  const hairOptions = useMemo(
    () =>
      items
        .filter((item) => item.barber.staffType !== "CARE")
        .map((item) => ({
          id: item.barber._id,
          fullName: item.barber.fullName,
          email: item.barber.email,
        })),
    [items]
  );

  const careOptions = useMemo(
    () =>
      items
        .filter((item) => item.barber.staffType === "CARE")
        .map((item) => ({
          id: item.barber._id,
          fullName: item.barber.fullName,
          email: item.barber.email,
        })),
    [items]
  );

  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        item.barber.staffType === "CARE"
          ? selectedCareIds.includes(item.barber._id)
          : selectedHairIds.includes(item.barber._id)
      ),
    [items, selectedHairIds, selectedCareIds]
  );

  const patchDraft = (barberId: string, value: Partial<DateDraft>) => {
    setDrafts((current) => ({
      ...current,
      [barberId]: {
        ...(current[barberId] ?? createDefaultDraft()),
        ...value,
      },
    }));
  };

  const loadDateSchedule = async (barberId: string, date: string) => {
    try {
      setError("");
      const result = await getReceptionBarberDayDetail(barberId, date);

      patchDraft(barberId, {
        date,
        startTime: result.schedule?.startTime ?? "09:00",
        endTime: result.schedule?.endTime ?? "21:00",
        isWorking: result.schedule?.isWorking ?? false,
        note: result.schedule?.note ?? "",
        source: result.source,
      });
    } catch {
      setError("Không thể tải lịch ngày đã chọn");
    }
  };

  const changeWeeklySchedule = (
    barberIndex: number,
    dayIndex: number,
    key: "startTime" | "endTime" | "isWorking",
    value: string | boolean
  ) => {
    setItems((current) =>
      current.map((item, currentBarberIndex) =>
        currentBarberIndex !== barberIndex
          ? item
          : {
              ...item,
              schedules: item.schedules.map((day, currentDayIndex) =>
                currentDayIndex !== dayIndex
                  ? day
                  : { ...day, [key]: value, breaks: [] }
              ),
            }
      )
    );
  };

  const saveWeeklySchedule = async (item: ReceptionBarberSchedule) => {
    try {
      setSaving(`week-${item.barber._id}`);
      setError("");
      await saveReceptionBarberSchedule(item.barber._id, item.schedules);
      setMessage(`Đã lưu lịch của ${item.barber.fullName}`);
    } catch {
      setError("Không thể lưu lịch làm việc");
    } finally {
      setSaving("");
    }
  };

  const saveDateSchedule = async (barberId: string) => {
    try {
      setSaving(`date-${barberId}`);
      setError("");
      const response = await saveReceptionDateOverride(
        barberId,
        drafts[barberId]
      );

      setItems((current) =>
        current.map((item) => {
          if (item.barber._id !== barberId) return item;

          const remainingOverrides = item.dateOverrides.filter(
            (override) => override.date !== response.override.date
          );

          return {
            ...item,
            dateOverrides: [...remainingOverrides, response.override].sort(
              (first, second) => first.date.localeCompare(second.date)
            ),
          };
        })
      );

      patchDraft(barberId, { source: "OVERRIDE" });
      setMessage("Đã lưu lịch cho ngày được chọn");
    } catch {
      setError(
        "Không thể lưu lịch ngày này. Có thể nhân viên đang có lịch hẹn nằm ngoài ca mới."
      );
    } finally {
      setSaving("");
    }
  };

  const resetDateSchedule = async (barberId: string) => {
    try {
      setError("");
      await removeReceptionDateOverride(barberId, drafts[barberId].date);

      setItems((current) =>
        current.map((item) =>
          item.barber._id !== barberId
            ? item
            : {
                ...item,
                dateOverrides: item.dateOverrides.filter(
                  (override) => override.date !== drafts[barberId].date
                ),
              }
        )
      );

      await loadDateSchedule(barberId, drafts[barberId].date);
      setMessage("Đã khôi phục lịch tuần cho ngày được chọn");
    } catch {
      setError("Không thể khôi phục lịch ngày này");
    }
  };

  const editDateOverride = (
    barberId: string,
    override: ReceptionBarberSchedule["dateOverrides"][number]
  ) => {
    patchDraft(barberId, {
      date: override.date,
      startTime: override.startTime,
      endTime: override.endTime,
      isWorking: override.isWorking,
      note: override.note,
      source: "OVERRIDE",
    });

    document
      .getElementById(`date-editor-${barberId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const removeListedOverride = async (barberId: string, date: string) => {
    try {
      setSaving(`remove-${barberId}-${date}`);
      setError("");
      await removeReceptionDateOverride(barberId, date);

      setItems((current) =>
        current.map((item) =>
          item.barber._id !== barberId
            ? item
            : {
                ...item,
                dateOverrides: item.dateOverrides.filter(
                  (override) => override.date !== date
                ),
              }
        )
      );

      if (drafts[barberId]?.date === date) {
        await loadDateSchedule(barberId, date);
      }

      setMessage("Đã hủy lịch điều chỉnh theo ngày");
    } catch {
      setError("Không thể hủy lịch điều chỉnh theo ngày");
    } finally {
      setSaving("");
    }
  };

  const openScheduleHistory = async (
    barber: ReceptionBarberSchedule["barber"]
  ) => {
    try {
      setHistoryBarber(barber);
      setHistoryLoading(true);
      setHistoryItems([]);
      const response = await getReceptionScheduleHistory(barber._id);
      setHistoryItems(response.items);
    } catch {
      setError("Không thể tải lịch sử thay đổi lịch làm việc");
    } finally {
      setHistoryLoading(false);
    }
  };

  const historyLabel = (changeType: ScheduleChangeHistoryItem["changeType"]) => {
    if (changeType === "WEEKLY_UPDATED") return "Cập nhật lịch tuần";
    if (changeType === "DATE_OVERRIDE_SAVED") return "Lưu lịch riêng";
    return "Hủy lịch riêng";
  };

  return (
    <div className="reception-page reception-page-embedded">
      <main className="reception-main schedule-management-main">
        <header className="schedule-page-heading">
          <div>
            <p className="eyebrow">THADS BARBER</p>
            <h1>Quản lý lịch làm việc</h1>
            <p>Điều chỉnh lịch riêng theo ngày hoặc lịch làm việc lặp hằng tuần.</p>
          </div>

          <Link
            className="schedule-back"
            to={
              isAdmin
                ? "/admin/barber-day-schedule"
                : "/receptionist/barber-day-schedule"
            }
          >
            Xem lịch chi tiết
          </Link>
        </header>

        <section className="staff-search-panel">
          <StaffMultiSelect
            label="Barber làm tóc"
            placeholder="Chọn Barber muốn xem"
            options={hairOptions}
            selectedIds={selectedHairIds}
            onChange={setSelectedHairIds}
          />
          <StaffMultiSelect
            label="Nhân viên chăm sóc"
            placeholder="Chọn nhân viên muốn xem"
            options={careOptions}
            selectedIds={selectedCareIds}
            onChange={setSelectedCareIds}
          />
        </section>

        {message && <div className="reception-alert success">{message}</div>}
        {error && <div className="reception-alert error">{error}</div>}

        {visibleItems.length === 0 && (
          <div className="schedule-empty-filter">
            Hãy chọn ít nhất một nhân viên trong bộ lọc phía trên.
          </div>
        )}

        <div className="reception-schedule-list modern">
          {visibleItems.map((item) => {
            const barberIndex = items.findIndex(
              (current) => current.barber._id === item.barber._id
            );
            const draft = drafts[item.barber._id] ?? createDefaultDraft();

            return (
              <section className="employee-week-card" key={item.barber._id}>
                <div className="schedule-barber-title">
                  <span className="barber-avatar">
                    {item.barber.fullName.charAt(0)}
                  </span>
                  <div>
                    <span
                      className={`employee-kind ${item.barber.staffType.toLowerCase()}`}
                    >
                      {item.barber.staffType === "CARE"
                        ? "NHÂN VIÊN CHĂM SÓC"
                        : "BARBER LÀM TÓC"}
                    </span>
                    <h2>{item.barber.fullName}</h2>
                    <p>
                      {item.barber.phone} · {item.barber.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="schedule-history-button"
                    onClick={() => void openScheduleHistory(item.barber)}
                  >
                    <span>↺</span>
                    Lịch sử thay đổi
                  </button>
                </div>

                <div
                  className="card-date-override"
                  id={`date-editor-${item.barber._id}`}
                >
                  <div className="date-override-heading">
                    <div>
                      <span className="eyebrow">ĐIỀU CHỈNH THEO NGÀY</span>
                      <p>Thay đổi riêng ngày được chọn, không ảnh hưởng lịch tuần.</p>
                    </div>
                  </div>

                  <div className="card-override-fields">
                    <label>
                      <span>Ngày áp dụng</span>
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(event) =>
                          void loadDateSchedule(
                            item.barber._id,
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label className="override-working-toggle">
                      <span>Trạng thái</span>
                      <span className="toggle-control">
                        <input
                          type="checkbox"
                          checked={draft.isWorking}
                          onChange={(event) =>
                            patchDraft(item.barber._id, {
                              isWorking: event.target.checked,
                            })
                          }
                        />
                        {draft.isWorking ? "Làm việc" : "Nghỉ"}
                      </span>
                    </label>

                    <label>
                      <span>Bắt đầu</span>
                      <input
                        type="time"
                        disabled={!draft.isWorking}
                        value={draft.startTime}
                        onChange={(event) =>
                          patchDraft(item.barber._id, {
                            startTime: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      <span>Kết thúc</span>
                      <input
                        type="time"
                        disabled={!draft.isWorking}
                        value={draft.endTime}
                        onChange={(event) =>
                          patchDraft(item.barber._id, {
                            endTime: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="override-note-field">
                      <span>Ghi chú</span>
                      <input
                        value={draft.note}
                        onChange={(event) =>
                          patchDraft(item.barber._id, {
                            note: event.target.value,
                          })
                        }
                        placeholder="Việc cá nhân, đổi ca..."
                      />
                    </label>

                    <div className="override-actions">
                      <button
                        type="button"
                        disabled={saving === `date-${item.barber._id}`}
                        onClick={() => void saveDateSchedule(item.barber._id)}
                      >
                        {saving === `date-${item.barber._id}`
                          ? "Đang lưu..."
                          : "Lưu ngày này"}
                      </button>
                      {draft.source === "OVERRIDE" && (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => void resetDateSchedule(item.barber._id)}
                        >
                          Bỏ lịch riêng
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="weekly-section-heading">
                  <div>
                    <span className="eyebrow">LỊCH LẶP HẰNG TUẦN</span>
                    <h3>Lịch làm việc cố định</h3>
                  </div>
                  <button
                    type="button"
                    disabled={saving === `week-${item.barber._id}`}
                    onClick={() => void saveWeeklySchedule(item)}
                  >
                    {saving === `week-${item.barber._id}` ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>

                <div className="weekly-grid">
                  {item.schedules.map((day, dayIndex) => (
                    <article
                      key={day.dayOfWeek}
                      className={day.isWorking ? "working-day" : "day-off"}
                    >
                      <div className="day-card-title">
                        <b>{dayNames[day.dayOfWeek]}</b>
                        <label className="mini-switch">
                          <input
                            type="checkbox"
                            checked={day.isWorking}
                            onChange={(event) =>
                              changeWeeklySchedule(
                                barberIndex,
                                dayIndex,
                                "isWorking",
                                event.target.checked
                              )
                            }
                          />
                          <span>{day.isWorking ? "Làm việc" : "Nghỉ"}</span>
                        </label>
                      </div>

                      <div className="day-times">
                        <label>
                          Bắt đầu
                          <input
                            type="time"
                            disabled={!day.isWorking}
                            value={day.startTime}
                            onChange={(event) =>
                              changeWeeklySchedule(
                                barberIndex,
                                dayIndex,
                                "startTime",
                                event.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          Kết thúc
                          <input
                            type="time"
                            disabled={!day.isWorking}
                            value={day.endTime}
                            onChange={(event) =>
                              changeWeeklySchedule(
                                barberIndex,
                                dayIndex,
                                "endTime",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>

                <section className="saved-overrides-section">
                  <div className="saved-overrides-heading">
                    <div>
                      <span className="eyebrow">LỊCH ĐÃ ĐIỀU CHỈNH</span>
                      <h3>Lịch riêng theo ngày</h3>
                    </div>
                    <b>{item.dateOverrides.length} lịch</b>
                  </div>

                  {item.dateOverrides.length === 0 ? (
                    <p className="saved-overrides-empty">
                      Chưa có lịch làm việc nào được điều chỉnh theo ngày.
                    </p>
                  ) : (
                    <div className="saved-overrides-list">
                      {item.dateOverrides.map((override) => (
                        <article key={override._id} className="saved-override-card">
                          <div className="saved-override-date">
                            <span>
                              {new Intl.DateTimeFormat("vi-VN", {
                                weekday: "long",
                              }).format(new Date(`${override.date}T00:00:00`))}
                            </span>
                            <strong>
                              {new Intl.DateTimeFormat("vi-VN").format(
                                new Date(`${override.date}T00:00:00`)
                              )}
                            </strong>
                          </div>

                          <div className="saved-override-shift">
                            <span>Ca làm việc</span>
                            <strong>
                              {override.isWorking
                                ? `${override.startTime} – ${override.endTime}`
                                : "Nghỉ cả ngày"}
                            </strong>
                          </div>

                          <div className="saved-override-note">
                            <span>Ghi chú</span>
                            <strong>{override.note || "Không có ghi chú"}</strong>
                          </div>

                          <div className="saved-override-actions">
                            <button
                              type="button"
                              className="edit"
                              onClick={() =>
                                editDateOverride(item.barber._id, override)
                              }
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="remove"
                              disabled={
                                saving ===
                                `remove-${item.barber._id}-${override.date}`
                              }
                              onClick={() =>
                                void removeListedOverride(
                                  item.barber._id,
                                  override.date
                                )
                              }
                            >
                              Hủy bỏ
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </section>
            );
          })}
        </div>

        {historyBarber && (
          <div
            className="schedule-history-backdrop"
            onMouseDown={() => setHistoryBarber(null)}
          >
            <section
              className="schedule-history-modal"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header>
                <div>
                  <span className="eyebrow">LỊCH SỬ THAY ĐỔI</span>
                  <h2>{historyBarber.fullName}</h2>
                  <p>
                    {historyBarber.phone} · {historyBarber.email}
                  </p>
                </div>
                <button
                  type="button"
                  className="history-modal-close"
                  onClick={() => setHistoryBarber(null)}
                  aria-label="Đóng"
                >
                  ×
                </button>
              </header>

              {historyLoading ? (
                <div className="history-loading">Đang tải lịch sử...</div>
              ) : historyItems.length === 0 ? (
                <div className="history-loading">
                  Chưa có thay đổi lịch làm việc nào.
                </div>
              ) : (
                <div className="schedule-history-list">
                  {historyItems.map((history) => (
                    <article key={history._id}>
                      <span
                        className={`history-type ${history.changeType.toLowerCase()}`}
                      >
                        {historyLabel(history.changeType)}
                      </span>
                      <div>
                        <strong>
                          {history.effectiveDate
                            ? `Ngày áp dụng: ${new Intl.DateTimeFormat(
                                "vi-VN"
                              ).format(
                                new Date(`${history.effectiveDate}T00:00:00`)
                              )}`
                            : "Thay đổi lịch làm việc cố định"}
                        </strong>
                        <p>{history.note || "Không có ghi chú"}</p>
                        <small>
                          {history.actor?.fullName || "Hệ thống"} ·{" "}
                          {new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "medium",
                          }).format(new Date(history.createdAt))}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default BarberSchedules;
