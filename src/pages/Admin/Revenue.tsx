import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "../../services/adminDashboard.service";
import { getCatalogBarbers } from "../../services/catalog.service";

import type { AdminDashboardData } from "../../types/AdminDashboard";
import type { CatalogBarber } from "../../types/Catalog";

import "./css/Revenue.css";
import { queryKeys } from "../../lib/queryKeys";

type RevenuePeriod = "DAY" | "MONTH" | "YEAR";

const money = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

const getError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message
      || "Không thể tải dữ liệu doanh thu.";
  }
  return "Không thể tải dữ liệu doanh thu.";
};

function Revenue() {
  const [period, setPeriod] = useState<RevenuePeriod>("MONTH");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [barberId, setBarberId] = useState("");
  const filters = { period, date, barberId: barberId || undefined };
  const revenueQuery = useQuery({
    queryKey: queryKeys.adminDashboard(filters),
    queryFn: async () => (await getAdminDashboard(filters)).data,
  });
  const barbersQuery = useQuery({
    queryKey: [...queryKeys.catalog, "barbers"],
    queryFn: async () => (await getCatalogBarbers()).barbers,
  });
  const data: AdminDashboardData | undefined = revenueQuery.data;
  const barbers: CatalogBarber[] = barbersQuery.data ?? [];
  const error = revenueQuery.error ? getError(revenueQuery.error) : "";

  const totalRevenue = useMemo(
    () => data?.revenueByBarber.reduce((sum, item) => sum + item.revenue, 0) ?? 0,
    [data]
  );

  const totalAppointments = useMemo(
    () => data?.revenueByBarber.reduce((sum, item) => sum + item.appointments, 0) ?? 0,
    [data]
  );

  const maxRevenue = useMemo(
    () => Math.max(...(data?.revenueByBarber.map((item) => item.revenue) ?? []), 1),
    [data]
  );

  const filterLabel = period === "DAY"
    ? "ngày đã chọn"
    : period === "MONTH"
      ? "tháng đã chọn"
      : "năm đã chọn";

  return (
    <div className="admin-revenue-page">
      <main className="admin-revenue-container">
        <header className="admin-revenue-header">
          <div>
            <span>BÁO CÁO TÀI CHÍNH</span>
            <h1>Quản lý doanh thu</h1>
            <p>Thống kê doanh thu đã thanh toán của từng thợ cắt tóc.</p>
          </div>

          <button type="button" onClick={() => void revenueQuery.refetch()}>Làm mới</button>
        </header>

        <section className="admin-revenue-filters">
          <label>
            Chu kỳ
            <select value={period} onChange={(event) => setPeriod(event.target.value as RevenuePeriod)}>
              <option value="DAY">Theo ngày</option>
              <option value="MONTH">Theo tháng</option>
              <option value="YEAR">Theo năm</option>
            </select>
          </label>

          <label>
            Ngày đối chiếu
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          <label>
            Barber
            <select value={barberId} onChange={(event) => setBarberId(event.target.value)}>
              <option value="">Tất cả Barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>{barber.fullName}</option>
              ))}
            </select>
          </label>
        </section>

        {error && <div className="admin-revenue-error">{error}</div>}

        <section className="admin-revenue-summary">
          <article><span>Tổng doanh thu {filterLabel}</span><strong>{money(totalRevenue)}đ</strong></article>
          <article><span>Lịch đã hoàn thành</span><strong>{totalAppointments}</strong></article>
          <article><span>Số Barber có doanh thu</span><strong>{data?.revenueByBarber.length ?? 0}</strong></article>
        </section>

        <section className="admin-revenue-chart-card">
          <div className="admin-revenue-chart-heading">
            <div><span>SO SÁNH BARBER</span><h2>Biểu đồ cột doanh thu</h2></div>
            <small>Chỉ tính lịch COMPLETED và PAID</small>
          </div>

          {revenueQuery.isPending ? (
            <p className="admin-revenue-empty">Đang tải biểu đồ...</p>
          ) : !data?.revenueByBarber.length ? (
            <p className="admin-revenue-empty">Chưa có doanh thu trong kỳ đã chọn.</p>
          ) : (
            <div className="admin-revenue-chart-scroll">
              <div className="admin-revenue-chart">
                {data.revenueByBarber.map((item) => {
                  const height = Math.max(4, Math.round(item.revenue / maxRevenue * 100));
                  return (
                    <article key={item.barberId}>
                      <div className="admin-revenue-bar-area">
                        <span>{money(item.revenue)}đ</span>
                        <div className="admin-revenue-bar" style={{ height: `${height}%` }} />
                      </div>
                      <b>{item.barberName}</b>
                      <small>{item.appointments} lịch</small>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {!!data?.revenueByBarber.length && (
          <section className="admin-revenue-ranking">
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "22px" }}>
              <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                Chi tiết doanh thu từng Barber
              </span>
            </h2>
            {data.revenueByBarber.map((item, index) => (
              <article key={item.barberId}>
                <b style={{ color: "#c6a15b", WebkitTextFillColor: "#c6a15b" }}>#{index + 1}</b>
                <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff", fontWeight: 600 }}>
                  {item.barberName}
                </span>
                <small style={{ color: "#aaa", WebkitTextFillColor: "#aaa" }}>
                  {item.appointments} lịch hoàn thành
                </small>
                <strong style={{ color: "#c6a15b", WebkitTextFillColor: "#c6a15b" }}>
                  {money(item.revenue)}đ
                </strong>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Revenue;
