import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getReceptionBarberDayDetail,
  getReceptionBarberSchedules,
  type BarberDayDetail,
  type ReceptionBarberSchedule,
} from "../../services/receptionist.service";

import StaffMultiSelect from "./StaffMultiSelect";
import "./Receptionist.css";

type DateRange = {
  from: string;
  to: string;
};

const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

const enumerateDates = (ranges: DateRange[]) => {
  const values = new Set<string>();

  ranges.forEach(({ from, to }) => {
    if (!from) return;

    const endValue = to || from;
    const current = new Date(`${from}T00:00:00`);
    const end = new Date(`${endValue}T00:00:00`);

    while (current <= end) {
      const dateValue = new Date(
        current.getTime() - current.getTimezoneOffset() * 60_000
      )
        .toISOString()
        .slice(0, 10);

      values.add(dateValue);
      current.setDate(current.getDate() + 1);
    }
  });

  return [...values].sort();
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

function BarberDaySchedule() {
  const [items, setItems] = useState<ReceptionBarberSchedule[]>([]);
  const [selectedHairIds, setSelectedHairIds] = useState<string[]>([]);
  const [selectedCareIds, setSelectedCareIds] = useState<string[]>([]);
  const [ranges, setRanges] = useState<Record<string, DateRange[]>>({});
  const [details, setDetails] = useState<Record<string, BarberDayDetail[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    getReceptionBarberSchedules()
      .then(({ items: responseItems }) => {
        setItems(responseItems);
        setSelectedHairIds(
          responseItems
            .filter((item) => item.barber.staffType !== "CARE")
            .map((item) => item.barber._id)
        );
        setSelectedCareIds(
          responseItems
            .filter((item) => item.barber.staffType === "CARE")
            .map((item) => item.barber._id)
        );
        setRanges(
          Object.fromEntries(
            responseItems.map((item) => [
              item.barber._id,
              [{ from: getLocalDate(), to: getLocalDate() }],
            ])
          )
        );
      })
      .catch(() => setError("Không thể tải danh sách nhân viên"));
  }, []);

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

  const updateRange = (
    barberId: string,
    index: number,
    key: keyof DateRange,
    value: string
  ) => {
    setRanges((current) => ({
      ...current,
      [barberId]: (current[barberId] ?? []).map((range, currentIndex) =>
        currentIndex === index ? { ...range, [key]: value } : range
      ),
    }));
  };

  const addRange = (barberId: string) => {
    setRanges((current) => ({
      ...current,
      [barberId]: [
        ...(current[barberId] ?? []),
        { from: getLocalDate(), to: getLocalDate() },
      ],
    }));
  };

  const removeRange = (barberId: string, index: number) => {
    setRanges((current) => ({
      ...current,
      [barberId]: (current[barberId] ?? []).filter(
        (_, currentIndex) => currentIndex !== index
      ),
    }));
  };

  const loadSchedule = async (barberId: string) => {
    const dates = enumerateDates(ranges[barberId] ?? []);

    if (dates.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày");
      return;
    }

    try {
      setLoading((current) => ({ ...current, [barberId]: true }));
      setError("");

      const result = await Promise.all(
        dates.map((date) => getReceptionBarberDayDetail(barberId, date))
      );

      setDetails((current) => ({ ...current, [barberId]: result }));
    } catch {
      setError("Không thể tải lịch chi tiết của nhân viên");
    } finally {
      setLoading((current) => ({ ...current, [barberId]: false }));
    }
  };

  return (
    <div className="reception-page reception-page-embedded schedule-detail-page">
      <main className="reception-main schedule-management-main">
        <header className="schedule-page-heading">
          <div>
            <p className="eyebrow">THADS BARBER</p>
            <h1>Lịch hẹn chi tiết nhân viên</h1>
            <p>
              Xem đồng thời lịch của Barber làm tóc và nhân viên chăm sóc theo
              nhiều khoảng ngày.
            </p>
          </div>
          <Link className="schedule-back" to="/receptionist/barbers">
            Chỉnh lịch làm việc
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

        {error && <div className="reception-alert error">{error}</div>}

        {visibleItems.length === 0 && (
          <div className="schedule-empty-filter">
            Hãy chọn ít nhất một nhân viên trong bộ lọc phía trên.
          </div>
        )}

        <div className="employee-schedule-list">
          {visibleItems.map((item) => (
            <section className="employee-schedule-card" key={item.barber._id}>
              <div className="barber-day-header">
                <div>
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
                </div>
              </div>

              <div className="employee-range-editor">
                <div className="range-list">
                  {(ranges[item.barber._id] ?? []).map((range, index) => (
                    <div className="range-row" key={index}>
                      <label>
                        Từ ngày
                        <input
                          type="date"
                          value={range.from}
                          onChange={(event) =>
                            updateRange(
                              item.barber._id,
                              index,
                              "from",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      <label>
                        Đến ngày
                        <input
                          type="date"
                          min={range.from}
                          value={range.to}
                          onChange={(event) =>
                            updateRange(
                              item.barber._id,
                              index,
                              "to",
                              event.target.value
                            )
                          }
                        />
                      </label>
                      {(ranges[item.barber._id] ?? []).length > 1 && (
                        <button
                          type="button"
                          className="remove-range"
                          title="Bỏ khoảng ngày"
                          onClick={() => removeRange(item.barber._id, index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="range-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => addRange(item.barber._id)}
                  >
                    + Thêm khoảng ngày
                  </button>
                  <button
                    type="button"
                    disabled={loading[item.barber._id]}
                    onClick={() => void loadSchedule(item.barber._id)}
                  >
                    {loading[item.barber._id] ? "Đang tải..." : "Xem lịch"}
                  </button>
                </div>
              </div>

              {(details[item.barber._id] ?? []).map((detail) => (
                <article className="employee-day-result" key={detail.date}>
                  <div className="day-result-heading">
                    <div>
                      <h3>{formatDate(detail.date)}</h3>
                      <span>
                        {detail.schedule?.isWorking
                          ? `Ca ${detail.schedule.startTime} – ${detail.schedule.endTime}`
                          : "Nghỉ"}
                      </span>
                    </div>
                    <b>
                      {detail.slots.filter((slot) => slot.booked).length} khung đã
                      có lịch
                    </b>
                  </div>

                  {!detail.schedule?.isWorking ? (
                    <div className="day-off-message">Nhân viên nghỉ ngày này</div>
                  ) : (
                    <div className="barber-slot-grid">
                      {detail.slots.map((slot) => (
                        <div
                          key={slot.startTime}
                          className={slot.booked ? "booked" : "available"}
                          title={
                            slot.booking
                              ? `${slot.booking.appointmentCode} · ${slot.booking.customerName}`
                              : "Còn trống"
                          }
                        >
                          <strong>{slot.startTime}</strong>
                          <span>{slot.endTime}</span>
                          {slot.booked && (
                            <small>
                              {slot.booking?.customerName}
                              <br />
                              {slot.booking?.appointmentCode}
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default BarberDaySchedule;
