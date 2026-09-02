import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "../../services/adminDashboard.service";
import { getCatalogBarbers } from "../../services/catalog.service";

import type { AdminDashboardData } from "../../types/AdminDashboard";
import type { CatalogBarber } from "../../types/Catalog";

import "./css/Revenue.css";
import { queryKeys } from "../../lib/queryKeys";

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
  const today = new Date().toISOString().slice(0, 10);
  const firstDayOfMonth = `${today.slice(0, 8)}01`;
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [appliedRange, setAppliedRange] = useState({ fromDate: firstDayOfMonth, toDate: today });
  const [filterError, setFilterError] = useState("");
  const [barberId, setBarberId] = useState("");
  const filters = { ...appliedRange, barberId: barberId || undefined };
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

  const filterLabel = "trong khoảng đã chọn";
  const completionRate = data?.outcomeSummary.completionRate ?? 0;
  const cancellationRate = data?.outcomeSummary.cancellationRate ?? 0;
  const outcomeChart = `conic-gradient(#42b883 0 ${completionRate}%, #e05b5b ${completionRate}% ${completionRate + cancellationRate}%, #35322d ${completionRate + cancellationRate}% 100%)`;

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
            Từ ngày
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>

          <label>
            Đến ngày
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
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
          <div className="admin-revenue-filter-actions">
            <button type="button" onClick={() => {
              if (!fromDate || !toDate) { setFilterError("Vui lòng chọn đủ từ ngày và đến ngày."); return; }
              if (fromDate > toDate) { setFilterError("Từ ngày không được lớn hơn đến ngày."); return; }
              setFilterError("");
              setAppliedRange({ fromDate, toDate });
            }}>Xem doanh thu</button>
            <button type="button" className="secondary" onClick={() => {
              setFromDate(firstDayOfMonth); setToDate(today);
              setAppliedRange({ fromDate: firstDayOfMonth, toDate: today }); setBarberId(""); setFilterError("");
            }}>Đặt lại</button>
          </div>
          {filterError && <p className="admin-revenue-filter-error">{filterError}</p>}
        </section>

        {error && <div className="admin-revenue-error">{error}</div>}

        <section className="admin-revenue-summary">
          <article><span>Tổng doanh thu {filterLabel}</span><strong>{money(totalRevenue)}đ</strong></article>
          <article><span>Lịch đã hoàn thành</span><strong>{totalAppointments}</strong></article>
          <article><span>Số Barber có doanh thu</span><strong>{data?.revenueByBarber.length ?? 0}</strong></article>
        </section>

        <section className="admin-revenue-visual-grid">
        <article className="admin-revenue-outcome-card">
          <div><span>CHẤT LƯỢNG LỊCH HẸN</span><h2>Tỷ lệ kết quả</h2></div>
          <div className="admin-revenue-donut" style={{ background: outcomeChart }}>
            <span><b>{completionRate}%</b> hoàn thành</span>
          </div>
          <ul>
            <li><i className="completed" /> Hoàn thành: <b>{data?.outcomeSummary.completed ?? 0} ({completionRate}%)</b></li>
            <li><i className="cancelled" /> Đã hủy: <b>{data?.outcomeSummary.cancelled ?? 0} ({cancellationRate}%)</b></li>
          </ul>
        </article>
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
        </section></section>

        {!!data?.revenueByBarber.length && (
          <section className="admin-revenue-ranking">
            <h2>Chi tiết doanh thu từng Barber</h2>
            {data.revenueByBarber.map((item, index) => (
              <article key={item.barberId}>
                <b>#{index + 1}</b>
                <span>{item.barberName}</span>
                <small>{item.appointments} lịch hoàn thành</small>
                <strong>{money(item.revenue)}đ</strong>
              </article>
            ))}
          </section>
        )}
        {!!data?.revenueByService?.length && (
          <section className="admin-revenue-ranking">
            <h2>Doanh thu và mức sử dụng dịch vụ</h2>
            {data.revenueByService.map((item, index) => (
              <article key={item.serviceId}><b>#{index + 1}</b><span>{item.serviceName}</span><small>{item.uses} lượt sử dụng</small><strong>{money(item.revenue)}đ</strong></article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Revenue;
