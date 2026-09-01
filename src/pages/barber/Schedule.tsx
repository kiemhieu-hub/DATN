import axios from "axios";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getBarberAppointments, 
  markBarberAppointmentViewed,
  updateBarberAppointmentStatus 
} from "../../services/barberAppointment.service";
import type { Appointment, AppointmentStatus } from "../../types/Appointment";
import { queryKeys } from "../../lib/queryKeys";
import "./css/Schedule.css";

const labels: Record<AppointmentStatus, string> = {
  PENDING: "Chờ xác nhận", 
  CONFIRMED: "Đã xác nhận", 
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện", 
  COMPLETED: "Đã hoàn thành", 
  NO_SHOW: "Vắng mặt", 
  CANCELLED: "Đã hủy",
};

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

function Schedule() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth("BARBER");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAll, setShowAll] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "BARBER") {
      navigate("/barber/login", { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const filters = showAll ? {} : {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || dateFrom || undefined,
  };

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments("barber", filters),
    queryFn: async () => (await getBarberAppointments(filters)).appointments,
    enabled: !authLoading && isAuthenticated && user?.role === "BARBER",
  });

  const items: Appointment[] = appointmentsQuery.data ?? [];
  const error = appointmentsQuery.error
    ? axios.isAxiosError(appointmentsQuery.error)
      ? appointmentsQuery.error.response?.data?.message || "Không thể tải lịch."
      : "Không thể tải lịch."
    : "";

  const viewedMutation = useMutation({
    mutationFn: markBarberAppointmentViewed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["thads", "appointments", "barber"] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) =>
      updateBarberAppointmentStatus(appointmentId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments("barber", filters) });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Không thể cập nhật trạng thái lịch hẹn!");
    },
  });

  const view = async (item: Appointment) => {
    if (!item.barberViewedAt) {
      await viewedMutation.mutateAsync(item._id);
    }
  };

  const handleStatusChange = (e: React.MouseEvent, appointmentId: string, targetStatus: AppointmentStatus) => {
    e.stopPropagation();
    statusMutation.mutate({ appointmentId, status: targetStatus });
  };

  return (
    <div className="barber-schedule-page">
      <main>
        <header>
          <div><p>THADS BARBER</p><h1>Lịch hẹn của tôi</h1><span>Lịch mới được ưu tiên; các lịch còn lại xếp theo thời gian gần nhất.</span></div>
          <nav><Link to="/barber/dashboard">Dashboard</Link><Link to="/barber/working-schedule">Lịch làm việc</Link><Link to="/barber/profile">Cá nhân</Link></nav>
        </header>

        <section className="schedule-filters">
          <label><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Hiển thị tất cả lịch hẹn</label>
          <label>Từ ngày<input disabled={showAll} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label>Đến ngày<input disabled={showAll} min={dateFrom} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          <button onClick={() => void appointmentsQuery.refetch()}>Áp dụng</button>
        </section>

        {error && <p className="schedule-error">{error}</p>}
        {appointmentsQuery.isPending ? <p className="schedule-empty">Đang tải...</p> : (
          <section className="schedule-list">
            {items.length === 0 && <p className="schedule-empty">Không có lịch hẹn phù hợp.</p>}
            {items.map((item) => (
              <article key={item._id} className={!item.barberViewedAt ? "new" : ""} onClick={() => void view(item)}>
                <div className="schedule-code">
                  {!item.barberViewedAt && <i />}
                  <small>MÃ LỊCH</small>
                  <b>{item.appointmentCode || item._id.slice(-8)}</b>
                </div>

                <div>
                  <small>KHÁCH SỬ DỤNG</small>
                  <b>{item.customer?.fullName || "Khách hàng"}</b>
                  <span>{item.customer?.phone}</span>
                </div>

                <div>
                  <small>THỜI GIAN</small>
                  <b>{item.appointmentDate}</b>
                  <span>{item.startTime}–{item.endTime}</span>
                </div>

                <div className="schedule-services">
                  <small>DỊCH VỤ</small>
                  <b>{item.services.map((service) => service.nameSnapshot).join(", ")}</b>
                </div>

                <div>
                  <small>GIÁ TRỊ</small>
                  <b>{money(item.totalPrice)}đ</b>
                </div>

                {/* CỘT TRẠNG THÁI & NÚT THAO TÁC (XẾP NGANG HÀNG) */}
                <div className="schedule-status-col">
                  <small>TRẠNG THÁI</small>
                  <div className="status-container">
                    <span className={`status ${item.status.toLowerCase()}`}>{labels[item.status]}</span>

                    {item.status === "CHECKED_IN" && (
                      <button 
                        className="btn-start"
                        disabled={statusMutation.isPending}
                        onClick={(e) => handleStatusChange(e, item._id, "IN_PROGRESS")}
                      >
                        {statusMutation.isPending ? "..." : "Bắt đầu"}
                      </button>
                    )}

                    {item.status === "IN_PROGRESS" && (
                      <button 
                        className="btn-complete"
                        disabled={statusMutation.isPending}
                        onClick={(e) => handleStatusChange(e, item._id, "COMPLETED")}
                      >
                        {statusMutation.isPending ? "..." : "Kết thúc"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Schedule;