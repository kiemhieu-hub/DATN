import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { realtimeSocket } from "../../lib/realtime";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { BarberLeaveRegistrationModal } from "../../components/BarberLeaveRegistrationModal";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  changeAdminAppointmentBarber,
  getAdminAppointment,
  getAdminAppointments,
  reopenAdminNoShowAppointment,
  rescheduleAdminAppointment,
  updateAdminAppointmentServices,
  updateAdminAppointmentStatus,
  updateAdminAppointmentWorkProgress,
} from "../../services/adminAppointment.service";
import { getCatalogBarbers, getCatalogServices } from "../../services/catalog.service";
import { confirmBankTransfer, confirmCashPayment } from "../../services/payment.service";

import type {
  Appointment,
  AppointmentStatus,
} from "../../types/Appointment";
import type { CatalogBarber, CatalogService } from "../../types/Catalog";

import "./css/Appointments.css";

interface StatusAction {
  status: AppointmentStatus;
  label: string;
}

interface ServiceEditorState {
  appointment: Appointment;
  selectedIds: string[];
}

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Vắng mặt",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<
  Appointment["paymentStatus"],
  string
> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang xử lý",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

const nextActions: Partial<
  Record<AppointmentStatus, StatusAction[]>
> = {
  PENDING: [
    {
      status: "CONFIRMED",
      label: "Xác nhận",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
  CONFIRMED: [
    {
      status: "NO_SHOW",
      label: "Vắng mặt",
    },
    {
      status: "CHECKED_IN",
      label: "Check-in",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
  CHECKED_IN: [
    { status: "IN_PROGRESS", label: "Bắt đầu" },
    { status: "CANCELLED", label: "Hủy" },
  ],
  IN_PROGRESS: [
    {
      status: "COMPLETED",
      label: "Hoàn thành",
    },
    {
      status: "CANCELLED",
      label: "Hủy",
    },
  ],
};

const statusActionIcons: Record<AppointmentStatus, string> = {
  PENDING: "…",
  CONFIRMED: "✓",
  CHECKED_IN: "↳",
  IN_PROGRESS: "▶",
  COMPLETED: "✓",
  NO_SHOW: "!",
  CANCELLED: "×",
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const getPaidDeposit = (appointment: Appointment): number => {
  return appointment.depositPaid ? appointment.depositAmount : 0;
};

const getRemainingPayment = (appointment: Appointment): number => {
  return Math.max(0, appointment.totalPrice - getPaidDeposit(appointment));
};

const getTransferQrUrl = (appointment: Appointment): string => {
  const amount = getRemainingPayment(appointment);
  const description = appointment.appointmentCode;
  const bankId = import.meta.env.VITE_BANK_ID?.trim();
  const accountNumber = import.meta.env.VITE_BANK_ACCOUNT_NO?.trim();
  const accountName = import.meta.env.VITE_BANK_ACCOUNT_NAME?.trim();

  if (bankId && accountNumber) {
    const params = new URLSearchParams({
      amount: String(amount),
      addInfo: description,
    });

    if (accountName) params.set("accountName", accountName);

    return `https://img.vietqr.io/image/${encodeURIComponent(
      bankId
    )}-${encodeURIComponent(accountNumber)}-compact2.png?${params.toString()}`;
  }

  const fallbackData = JSON.stringify({
    merchant: "THADS BARBER",
    appointmentCode: description,
    amount,
  });

  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    fallbackData
  )}`;
};

const getPaymentLabel = (appointment: Appointment): string => {
  if (appointment.paymentStatus === "PAID") return "Đã thanh toán";
  if (appointment.paymentStatus === "REFUNDED") return "Đã hoàn tiền";
  if (appointment.depositPaid) {
    return `Đã cọc: ${formatMoney(appointment.depositAmount)}đ`;
  }

  return "Chưa thanh toán";
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const getUserName = (
  value: Appointment["client"] | Appointment["barber"]
): string => {
  if (typeof value === "string") {
    return "Không xác định";
  }

  return value.fullName;
};

const getErrorMessage = (
  error: unknown,
  fallback = "Có lỗi xảy ra"
): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return responseData?.message || fallback;
  }

  return fallback;
};

function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const isReceptionistPage = location.pathname.startsWith("/receptionist");
  const authRole = isReceptionistPage ? "RECEPTIONIST" : "ADMIN";
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth(authRole);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<CatalogBarber[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
  const [barberFilter, setBarberFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"priority" | "newest" | "oldest">("priority");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState("");

  const [reopenForm, setReopenForm] = useState<{
    appointment: Appointment;
    mode: "CHECK_IN" | "RESCHEDULE";
    appointmentDate: string;
    startTime: string;
    barberId: string;
  } | null>(null);

  const [receipt, setReceipt] = useState<{
    appointment: Appointment;
    method: "CASH" | "BANK_TRANSFER";
  } | null>(null);

  const [serviceEditor, setServiceEditor] = useState<ServiceEditorState | null>(null);

  const [paymentDialog, setPaymentDialog] = useState<{
    appointment: Appointment;
    method: "CASH" | "BANK_TRANSFER";
  } | null>(null);

  const [cancelDialog, setCancelDialog] = useState<{
    appointment: Appointment;
    reason: string;
    presetReason: string;
  } | null>(null);

  // Modal Popup đổi lịch hẹn
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    appointment: Appointment;
    appointmentDate: string;
    startTime: string;
  } | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchBusinessQuery("admin-appointments", () => getAdminAppointments({
        keyword: submittedKeyword || undefined,
        status: statusFilter,
        barberId: barberFilter || undefined,
        appointmentDate: dateFilter || undefined,
        appointmentTime: timeFilter || undefined,
        sortOrder,
        page,
        limit: 10,
      }), {
        keyword: submittedKeyword || undefined,
        status: statusFilter,
        barberId: barberFilter || undefined,
        appointmentDate: dateFilter || undefined,
        appointmentTime: timeFilter || undefined,
        sortOrder,
        page,
        limit: 10,
      });

      setAppointments(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải danh sách lịch hẹn"));
    } finally {
      setLoading(false);
    }
  }, [
    submittedKeyword,
    statusFilter,
    barberFilter,
    dateFilter,
    timeFilter,
    sortOrder,
    page,
  ]);

  const loadBarbers = useCallback(async () => {
    try {
      const response = await fetchBusinessQuery("catalog-barbers", () => getCatalogBarbers());
      setBarbers(response.barbers);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải danh sách Barber"));
    }
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const response = await fetchBusinessQuery("catalog-services", () => getCatalogServices());
      setServices(response.services);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải danh sách dịch vụ"));
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user || user.role !== authRole) {
      navigate(isReceptionistPage ? "/receptionist/login" : "/admin/login", {
        replace: true,
      });
      return;
    }

    void loadAppointments();
    void loadBarbers();
    void loadServices();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadAppointments,
    loadBarbers,
    loadServices,
    authRole,
    isReceptionistPage,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== authRole) return;

    const handleAppointmentsChanged = (): void => {
      void loadAppointments();
    };

    realtimeSocket.on("appointments:changed", handleAppointmentsChanged);

    return () => {
      realtimeSocket.off("appointments:changed", handleAppointmentsChanged);
    };
  }, [authRole, isAuthenticated, loadAppointments, user]);

  useRealtimeRefresh(() => {
    void loadAppointments();
    void loadBarbers();
    void loadServices();
  }, Boolean(isAuthenticated && user?.role === authRole));

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== authRole) return;

    const appointmentId = new URLSearchParams(location.search).get("appointmentId");
    if (!appointmentId) return;

    const openAppointmentFromNotification = async (): Promise<void> => {
      try {
        setProcessingId(appointmentId);
        setError("");

        const response = await fetchBusinessQuery("admin-appointment-detail", () => getAdminAppointment(appointmentId), appointmentId, 0);
        setSelectedAppointment(response.appointment);

        const currentBarberId =
          typeof response.appointment.barber === "string"
            ? response.appointment.barber
            : response.appointment.barber._id;

        setSelectedBarberId(currentBarberId);
      } catch (requestError) {
        setError(getErrorMessage(requestError, "Không thể mở lịch hẹn từ thông báo"));
      } finally {
        setProcessingId(null);
      }
    };

    void openAppointmentFromNotification();
  }, [authRole, isAuthenticated, location.search, user]);

  const handleSearch = (event: FormEvent): void => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  const openDetail = async (appointment: Appointment): Promise<void> => {
    try {
      setProcessingId(appointment._id);
      setError("");
      const response = await fetchBusinessQuery("admin-appointment-detail", () => getAdminAppointment(appointment._id), appointment._id, 0);
      setSelectedAppointment(response.appointment);

      const currentBarberId =
        typeof response.appointment.barber === "string"
          ? response.appointment.barber
          : response.appointment.barber._id;

      setSelectedBarberId(currentBarberId);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải chi tiết lịch hẹn"));
    } finally {
      setProcessingId(null);
    }
  };

  const closeDetail = (): void => {
    if (processingId) return;

    setSelectedAppointment(null);
    setSelectedBarberId("");

    if (new URLSearchParams(location.search).has("appointmentId")) {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleChangeStatus = async (
    appointment: Appointment,
    targetStatus: AppointmentStatus
  ): Promise<void> => {
    if (targetStatus === "CANCELLED") {
      setCancelDialog({
        appointment,
        presetReason: "Khách bận việc đột xuất",
        reason: "",
      });
      return;
    }

    const confirmed = window.confirm(`Chuyển lịch sang “${statusLabels[targetStatus]}”?`);
    if (!confirmed) return;

    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");

      const response = await updateAdminAppointmentStatus(appointment._id, targetStatus);
      setMessage(response.message);

      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể cập nhật trạng thái lịch hẹn"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (!cancelDialog) return;

    const fullReason = cancelDialog.reason.trim()
      ? `${cancelDialog.presetReason}: ${cancelDialog.reason.trim()}`
      : cancelDialog.presetReason;

    try {
      setProcessingId(cancelDialog.appointment._id);
      setError("");
      setMessage("");

      const response = await updateAdminAppointmentStatus(
        cancelDialog.appointment._id,
        "CANCELLED",
        fullReason
      );

      setMessage(response.message || "Đã hủy lịch hẹn thành công");
      setCancelDialog(null);

      if (selectedAppointment?._id === cancelDialog.appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      const errorMsg = getErrorMessage(requestError, "Không thể hủy lịch hẹn");
      setError(errorMsg);
      alert(`Lỗi khi hủy: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeBarber = async (): Promise<void> => {
    if (!selectedAppointment) return;

    if (!selectedBarberId) {
      setError("Vui lòng chọn Barber mới");
      return;
    }

    try {
      setProcessingId(selectedAppointment._id);
      setError("");
      setMessage("");

      const response = await changeAdminAppointmentBarber(
        selectedAppointment._id,
        selectedBarberId
      );

      setMessage(response.message);
      setSelectedAppointment(response.appointment);
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể đổi Barber"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCashPayment = async (appointment: Appointment): Promise<void> => {
    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");

      const response = await confirmCashPayment(appointment._id);
      setMessage(response.message);
      setPaymentDialog(null);
      setReceipt({ appointment: response.appointment, method: "CASH" });

      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể xác nhận thanh toán tiền mặt"));
    } finally {
      setProcessingId(null);
    }
  };

  const openReopenModal = (appointment: Appointment): void => {
    const currentBarberId = typeof appointment.barber === "string"
      ? appointment.barber
      : appointment.barber._id;

    setReopenForm({
      appointment,
      mode: "CHECK_IN",
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      barberId: currentBarberId,
    });
    setError("");
  };

  const handleReopenNoShow = async (): Promise<void> => {
    if (!reopenForm) return;

    try {
      setProcessingId(reopenForm.appointment._id);
      setError("");
      setMessage("");

      const response = await reopenAdminNoShowAppointment(
        reopenForm.appointment._id,
        reopenForm.mode === "CHECK_IN"
          ? { mode: "CHECK_IN" }
          : {
            mode: "RESCHEDULE",
            appointmentDate: reopenForm.appointmentDate,
            startTime: reopenForm.startTime,
            barberId: reopenForm.barberId,
          }
      );

      setMessage(response.message);
      setReopenForm(null);
      if (selectedAppointment?._id === response.appointment._id) {
        setSelectedAppointment(response.appointment);
      }
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể bật lại lịch vắng mặt"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleBankTransfer = async (appointment: Appointment): Promise<void> => {
    try {
      setProcessingId(appointment._id);
      setError("");
      const response = await confirmBankTransfer(appointment._id);
      setMessage(response.message);
      setPaymentDialog(null);
      setReceipt({ appointment: response.appointment, method: "BANK_TRANSFER" });
      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể xác nhận chuyển khoản"));
    } finally {
      setProcessingId(null);
    }
  };

  // Mở Popup Đổi lịch
  const openRescheduleModal = (appointment: Appointment): void => {
    setRescheduleDialog({
      appointment,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
    });
    setError("");
  };

  // Xác nhận đổi lịch trong Popup
  const handleConfirmReschedule = async (): Promise<void> => {
    if (!rescheduleDialog) return;
    const { appointment, appointmentDate, startTime } = rescheduleDialog;

    if (!appointmentDate || !startTime) {
      setError("Vui lòng chọn đầy đủ ngày và giờ hẹn mới.");
      return;
    }

    try {
      setProcessingId(appointment._id);
      setError("");
      setMessage("");

      const response = await rescheduleAdminAppointment(
        appointment._id,
        appointmentDate,
        startTime,
        true
      );

      setMessage(response.message || "Đổi lịch hẹn thành công.");
      setRescheduleDialog(null);

      if (selectedAppointment?._id === appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể đổi lịch hẹn"));
    } finally {
      setProcessingId(null);
    }
  };

  const openServiceEditor = (appointment: Appointment): void => {
    const currentIds = appointment.services.map((item) =>
      typeof item.service === "string" ? item.service : item.service._id
    );

    setError("");
    setServiceEditor({ appointment, selectedIds: currentIds });
  };

  const addEditorService = (serviceId: string): void => {
    setServiceEditor((current) => {
      if (!current || current.selectedIds.includes(serviceId)) return current;

      return {
        ...current,
        selectedIds: [...current.selectedIds, serviceId],
      };
    });
  };

  const removeEditorService = (serviceId: string): void => {
    setServiceEditor((current) => {
      if (!current) return current;

      return {
        ...current,
        selectedIds: current.selectedIds.filter((id) => id !== serviceId),
      };
    });
  };

  const saveEditorServices = async (): Promise<void> => {
    if (!serviceEditor) return;

    if (serviceEditor.selectedIds.length === 0) {
      setError("Lịch hẹn phải có ít nhất một dịch vụ");
      return;
    }

    try {
      setProcessingId(serviceEditor.appointment._id);
      setError("");

      const response = await updateAdminAppointmentServices(
        serviceEditor.appointment._id,
        serviceEditor.selectedIds
      );

      setMessage(response.message);
      setServiceEditor(null);

      if (selectedAppointment?._id === response.appointment._id) {
        setSelectedAppointment(response.appointment);
      }

      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể cập nhật dịch vụ"));
    } finally {
      setProcessingId(null);
    }
  };

  const changeWorkProgress = async (
    segment: "HAIR" | "CARE",
    action: "START" | "COMPLETE"
  ): Promise<void> => {
    if (!selectedAppointment) return;
    const label = `${action === "START" ? "bắt đầu" : "hoàn thành"} phần ${segment === "HAIR" ? "làm tóc" : "chăm sóc"}`;
    if (!window.confirm(`Xác nhận ${label}?`)) return;
    try {
      setProcessingId(selectedAppointment._id);
      const response = await updateAdminAppointmentWorkProgress(selectedAppointment._id, segment, action);
      setSelectedAppointment(response.appointment);
      setMessage(response.message);
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, `Không thể ${label}`));
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || (loading && appointments.length === 0)) {
    return (
      <div className="admin-appointments-page">
        <div className="appointment-loading">
          <div className="appointment-loading-spinner" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== authRole) {
    return null;
  }

  const selectedActivities = selectedAppointment?.activities ?? [];

  return (
    <div className="admin-appointments-page">
      <main className="admin-appointments-container">
        <header className="admin-appointments-header">
          <div className="admin-appointments-title">
            <p className="admin-appointments-brand">THADS BARBER</p>
            <h1>Quản lý lịch hẹn</h1>
            <p className="admin-appointments-description">
              {isReceptionistPage
                ? "Xác nhận, check-in, điều phối dịch vụ và thanh toán lịch hẹn."
                : "Theo dõi và xử lý toàn bộ lịch hẹn trong hệ thống."}
            </p>
          </div>

          <nav className="admin-appointments-navigation">
            <Link to={isReceptionistPage ? "/receptionist/dashboard" : "/admin/dashboard"}>Dashboard</Link>
            <Link to={isReceptionistPage ? "/receptionist/barbers" : "/admin/barber-schedules"}>Lịch Barber</Link>
          </nav>
        </header>

        {error && <div className="appointment-alert appointment-alert-error">{error}</div>}
        {message && <div className="appointment-alert appointment-alert-success">{message}</div>}

        <form className="appointment-filters" onSubmit={handleSearch}>
          <div className="appointment-filter-field appointment-filter-search">
            <label htmlFor="appointment-keyword">Tìm khách hàng</label>
            <input
              id="appointment-keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-status">Trạng thái</label>
            <select
              id="appointment-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as AppointmentStatus | "ALL");
                setPage(1);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([statusValue, label]) => (
                <option key={statusValue} value={statusValue}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-time">Giờ bắt đầu</label>
            <input
              id="appointment-time"
              type="time"
              value={timeFilter}
              onChange={(event) => { setTimeFilter(event.target.value); setPage(1); }}
            />
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-sort">Thứ tự</label>
            <select
              id="appointment-sort"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as "priority" | "newest" | "oldest");
                setPage(1);
              }}
            >
              <option value="priority">Ưu tiên xử lý (mặc định)</option>
              <option value="newest">Mới nhất → cũ nhất</option>
              <option value="oldest">Cũ nhất → mới nhất</option>
            </select>
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-barber">Barber</label>
            <select
              id="appointment-barber"
              value={barberFilter}
              onChange={(event) => {
                setBarberFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả Barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="appointment-filter-field">
            <label htmlFor="appointment-date">Ngày hẹn</label>
            <input
              id="appointment-date"
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <button type="submit" className="appointment-search-button">
            Tìm kiếm
          </button>

          {isReceptionistPage && (
            <button
              type="button"
              className="appointment-search-button"
              style={{ backgroundColor: "#1a1918", color: "#e5b869", fontWeight: "bold" }}
              onClick={() => setIsLeaveModalOpen(true)}
            >
              + Đăng ký nghỉ
            </button>
          )}
        </form>

        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Barber</th>
                <th>Dịch vụ</th>
                <th>Thời gian</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="appointment-empty">
                    Không có lịch hẹn phù hợp.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong className="appointment-customer-name">
                        {getUserName(appointment.client)}
                      </strong>

                      {typeof appointment.client !== "string" && (
                        <div className="appointment-customer-contact">
                          <span>{appointment.client.phone}</span>
                          <span>{appointment.client.email}</span>
                        </div>
                      )}
                    </td>

                    <td>{getUserName(appointment.barber)}</td>

                    <td>
                      <div className="appointment-service-list">
                        {appointment.services.map((service) => (
                          <span key={`${appointment._id}-${service.nameSnapshot}`}>
                            {service.nameSnapshot}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <strong>{formatDate(appointment.appointmentDate)}</strong>
                      <span className="appointment-time">
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </td>

                    <td className="appointment-price">
                      {formatMoney(appointment.totalPrice)}đ
                    </td>

                    <td>
                      <span className={`appointment-status appointment-status-${appointment.status.toLowerCase()}`}>
                        {statusLabels[appointment.status]}
                      </span>
                    </td>

                    <td>
                      <span className={`appointment-payment-status ${appointment.depositPaid && appointment.paymentStatus !== "PAID" ? "appointment-payment-deposit" : `appointment-payment-${appointment.paymentStatus.toLowerCase()}`}`}>
                        {getPaymentLabel(appointment)}
                      </span>
                    </td>

                    <td>
                      <div className="appointment-actions">
                        <button
                          type="button"
                          className="appointment-icon-button appointment-icon-detail"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết"
                          onClick={() => void openDetail(appointment)}
                        >
                          ⓘ
                        </button>

                        {appointment.status === "NO_SHOW" && (
                          <button
                            type="button"
                            className="appointment-icon-button appointment-icon-reopen"
                            title="Bật lại lịch vắng mặt"
                            aria-label="Bật lại lịch vắng mặt"
                            disabled={processingId === appointment._id}
                            onClick={() => openReopenModal(appointment)}
                          >
                            ↻
                          </button>
                        )}

                        {(nextActions[appointment.status] ?? []).map((action) => (
                          <button
                            type="button"
                            key={action.status}
                            disabled={processingId === appointment._id}
                            title={action.label}
                            aria-label={action.label}
                            className={`appointment-icon-button ${action.status === "CANCELLED" ? "appointment-icon-cancel" : `appointment-icon-${action.status.toLowerCase()}`}`}
                            onClick={() => void handleChangeStatus(appointment, action.status)}
                          >
                            {statusActionIcons[action.status]}
                          </button>
                        ))}

                        {!(["COMPLETED", "CANCELLED"] as AppointmentStatus[]).includes(appointment.status) && (
                          <button
                            type="button"
                            className="appointment-icon-button appointment-icon-reschedule"
                            title="Đổi lịch hẹn"
                            aria-label="Đổi lịch hẹn"
                            disabled={processingId === appointment._id}
                            onClick={() => openRescheduleModal(appointment)}
                          >
                            ◷
                          </button>
                        )}

                        {(["CHECKED_IN", "IN_PROGRESS"] as AppointmentStatus[]).includes(appointment.status) && (
                          <button
                            type="button"
                            className="appointment-icon-button appointment-icon-services"
                            title="Thêm hoặc bớt dịch vụ"
                            aria-label="Thêm hoặc bớt dịch vụ"
                            disabled={processingId === appointment._id}
                            onClick={() => openServiceEditor(appointment)}
                          >
                            ±
                          </button>
                        )}

                        {appointment.status === "COMPLETED" &&
                          appointment.paymentStatus !== "PAID" && (
                            <button
                              type="button"
                              className="appointment-icon-button appointment-icon-payment"
                              title="Thanh toán"
                              aria-label="Thanh toán"
                              disabled={processingId === appointment._id}
                              onClick={() => setPaymentDialog({
                                appointment,
                                method: "CASH",
                              })}
                            >
                              ₫
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="appointment-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Trang trước
          </button>

          <span>
            Trang {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Trang sau
          </button>
        </div>
      </main>

      {selectedAppointment && (
        <div className="appointment-modal-backdrop" onMouseDown={closeDetail}>
          <section className="appointment-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="appointment-modal-close" onClick={closeDetail}>
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2>Chi tiết lịch hẹn</h2>

            <div className="appointment-detail-grid">
              <div>
                <span>Khách hàng</span>
                <strong>{getUserName(selectedAppointment.client)}</strong>
              </div>

              <div>
                <span>Barber</span>
                <strong>{getUserName(selectedAppointment.barber)}</strong>
              </div>

              <div>
                <span>Ngày hẹn</span>
                <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
              </div>

              <div>
                <span>Khung giờ</span>
                <strong>{selectedAppointment.startTime} - {selectedAppointment.endTime}</strong>
              </div>

              <div>
                <span>Thời lượng</span>
                <strong>{selectedAppointment.durationMinutes} phút</strong>
              </div>

              <div>
                <span>Thanh toán</span>
                <strong>{paymentStatusLabels[selectedAppointment.paymentStatus]}</strong>
              </div>
            </div>

            <h3>Dịch vụ</h3>

            <ul className="appointment-detail-services">
              {selectedAppointment.services.map((service, index) => (
                <li key={`${service.nameSnapshot}-${index}`}>
                  <span>
                    {service.nameSnapshot}
                    <small>{service.durationSnapshot} phút</small>
                  </span>
                  <strong>{formatMoney(service.priceSnapshot)}đ</strong>
                </li>
              ))}
            </ul>

            <div className="appointment-detail-total">
              <span>
                Tổng dịch vụ: {formatMoney(selectedAppointment.subtotal)}đ
                {selectedAppointment.voucherCode ? ` · Voucher ${selectedAppointment.voucherCode}: -${formatMoney(selectedAppointment.discountAmount)}đ` : ""}
                <br />
                Đặt cọc: {selectedAppointment.depositRequired ? `${formatMoney(selectedAppointment.depositAmount)}đ (${selectedAppointment.depositPaid ? "đã cọc" : "chưa cọc"})` : "không yêu cầu"}
                <br />
                Còn phải thu
              </span>
              <strong>{formatMoney(selectedAppointment.totalPrice)}đ</strong>
            </div>

            <div className="appointment-detail-note">
              <strong>Ghi chú:</strong>
              <span>{selectedAppointment.note || "Không có ghi chú"}</span>
            </div>

            {selectedAppointment.workProgress && ["CHECKED_IN", "IN_PROGRESS"].includes(selectedAppointment.status) && (
              <section className="appointment-work-progress">
                <h3>Tiến độ thực hiện</h3>
                {(["HAIR", "CARE"] as const).map((segment) => {
                  const key = segment === "HAIR" ? "hair" : "care";
                  const value = selectedAppointment.workProgress?.[key];
                  if (value === "NOT_REQUIRED") return null;
                  return (
                    <div key={segment}>
                      <span>{segment === "HAIR" ? "Barber làm tóc" : "Nhân viên chăm sóc"}</span>
                      <b>{value === "PENDING" ? "Chưa bắt đầu" : value === "IN_PROGRESS" ? "Đang thực hiện" : "Đã hoàn thành"}</b>
                      {value === "PENDING" && (
                        <button disabled={processingId === selectedAppointment._id} onClick={() => void changeWorkProgress(segment, "START")}>
                          Bắt đầu
                        </button>
                      )}
                      {value === "IN_PROGRESS" && (
                        <button disabled={processingId === selectedAppointment._id} onClick={() => void changeWorkProgress(segment, "COMPLETE")}>
                          Hoàn thành phần việc
                        </button>
                      )}
                    </div>
                  );
                })}
                <small>Lịch chỉ hoàn thành khi tất cả phần việc bắt buộc đều đã hoàn thành.</small>
              </section>
            )}

            {selectedAppointment.cancellation && (
              <div className="appointment-cancel-reason">
                <strong>Lý do hủy:</strong>
                <span>
                  {selectedAppointment.cancellation.reason}
                  <br />
                  Hoàn cọc: {selectedAppointment.cancellation.depositRefundStatus === "ELIGIBLE" ? `Đủ điều kiện · ${formatMoney(selectedAppointment.cancellation.depositRefundAmount ?? 0)}đ` : selectedAppointment.cancellation.depositRefundStatus === "REFUNDED" ? "Đã hoàn" : selectedAppointment.cancellation.depositRefundStatus === "NOT_ELIGIBLE" ? "Không đủ điều kiện" : "Không áp dụng"}
                </span>
              </div>
            )}

            <section className="appointment-activity-section">
              <h3>Lịch sử hoạt động</h3>

              {selectedActivities.length > 0 ? (
                <div className="appointment-activity-timeline">
                  {selectedActivities.map((activity) => {
                    const actorName =
                      activity.actor && typeof activity.actor !== "string"
                        ? activity.actor.fullName
                        : activity.actorRole === "SYSTEM"
                          ? "Hệ thống"
                          : activity.actorRole;

                    return (
                      <article className="appointment-activity-item" key={activity._id}>
                        <span className="appointment-activity-dot" />
                        <div>
                          <strong>{activity.description}</strong>
                          <p>
                            {actorName} ·{" "}
                            {new Intl.DateTimeFormat("vi-VN", {
                              dateStyle: "short",
                              timeStyle: "medium",
                            }).format(new Date(activity.createdAt))}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="appointment-activity-empty">
                  Lịch hẹn chưa có hoạt động được ghi nhận.
                </p>
              )}
            </section>

            {selectedAppointment.status === "COMPLETED" &&
              selectedAppointment.paymentStatus !== "PAID" && (
                <button
                  type="button"
                  className="appointment-modal-payment-button"
                  disabled={processingId === selectedAppointment._id}
                  onClick={() => setPaymentDialog({
                    appointment: selectedAppointment,
                    method: "CASH",
                  })}
                >
                  {processingId === selectedAppointment._id
                    ? "Đang xác nhận..."
                    : `Thanh toán ${formatMoney(getRemainingPayment(selectedAppointment))}đ`}
                </button>
              )}

            {!["COMPLETED", "CANCELLED"].includes(selectedAppointment.status) && (
              <div className="appointment-change-barber">
                <label htmlFor="new-barber">
                  Đổi Barber
                  <select
                    id="new-barber"
                    value={selectedBarberId}
                    onChange={(event) => setSelectedBarberId(event.target.value)}
                  >
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  disabled={processingId === selectedAppointment._id}
                  onClick={() => void handleChangeBarber()}
                >
                  {processingId === selectedAppointment._id ? "Đang lưu..." : "Lưu Barber"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {paymentDialog && (
        <div className="appointment-modal-backdrop" onMouseDown={() => !processingId && setPaymentDialog(null)}>
          <section className="appointment-modal appointment-payment-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="appointment-modal-close"
              aria-label="Đóng"
              disabled={Boolean(processingId)}
              onClick={() => setPaymentDialog(null)}
            >
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2>Xác nhận thanh toán</h2>
            <p className="appointment-payment-description">
              {paymentDialog.appointment.appointmentCode} · {getUserName(paymentDialog.appointment.client)}
            </p>

            <div className="appointment-payment-summary">
              <div>
                <span>Tổng hóa đơn</span>
                <strong>{formatMoney(paymentDialog.appointment.totalPrice)}đ</strong>
              </div>
              <div>
                <span>Đã đặt cọc</span>
                <strong>-{formatMoney(getPaidDeposit(paymentDialog.appointment))}đ</strong>
              </div>
              <div className="appointment-payment-remaining">
                <span>Số tiền còn phải thu</span>
                <strong>{formatMoney(getRemainingPayment(paymentDialog.appointment))}đ</strong>
              </div>
            </div>

            <h3>Chọn phương thức thanh toán</h3>
            <div className="appointment-payment-methods">
              <button
                type="button"
                className={paymentDialog.method === "CASH" ? "active" : ""}
                onClick={() => setPaymentDialog({ ...paymentDialog, method: "CASH" })}
              >
                <span>₫</span>
                <div>
                  <strong>Tiền mặt</strong>
                  <small>Thu tiền trực tiếp tại quầy</small>
                </div>
                <b>{paymentDialog.method === "CASH" ? "✓" : ""}</b>
              </button>

              <button
                type="button"
                className={paymentDialog.method === "BANK_TRANSFER" ? "active" : ""}
                onClick={() => setPaymentDialog({ ...paymentDialog, method: "BANK_TRANSFER" })}
              >
                <span>⇄</span>
                <div>
                  <strong>Chuyển khoản</strong>
                  <small>Xác nhận giao dịch ngân hàng</small>
                </div>
                <b>{paymentDialog.method === "BANK_TRANSFER" ? "✓" : ""}</b>
              </button>
            </div>

            {paymentDialog.method === "BANK_TRANSFER" && (
              <div className="appointment-transfer-qr">
                <div>
                  <span>Quét mã để chuyển khoản</span>
                  <strong>{formatMoney(getRemainingPayment(paymentDialog.appointment))}đ</strong>
                  <small>Nội dung: {paymentDialog.appointment.appointmentCode}</small>
                </div>

                <img
                  src={getTransferQrUrl(paymentDialog.appointment)}
                  alt={`QR thanh toán lịch ${paymentDialog.appointment.appointmentCode}`}
                />
              </div>
            )}

            <div className="appointment-payment-actions">
              <button
                type="button"
                className="appointment-payment-cancel"
                disabled={Boolean(processingId)}
                onClick={() => setPaymentDialog(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="appointment-payment-confirm"
                disabled={Boolean(processingId)}
                onClick={() => paymentDialog.method === "CASH"
                  ? void handleCashPayment(paymentDialog.appointment)
                  : void handleBankTransfer(paymentDialog.appointment)}
              >
                {processingId
                  ? "Đang xác nhận..."
                  : `Xác nhận đã thu ${formatMoney(getRemainingPayment(paymentDialog.appointment))}đ`}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal Popup Đổi lịch hẹn mới */}
      {rescheduleDialog && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={() => !processingId && setRescheduleDialog(null)}
        >
          <section
            className="appointment-modal"
            style={{
              maxWidth: "500px",
              background: "#1c1c1a",
              border: "1px solid #c6a15b",
              color: "#eee",
              padding: "26px",
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="appointment-modal-close"
              aria-label="Đóng"
              disabled={Boolean(processingId)}
              onClick={() => setRescheduleDialog(null)}
            >
              ×
            </button>

            <p className="appointment-modal-brand" style={{ color: "#c6a15b", fontSize: "11px", letterSpacing: "2px" }}>
              THADS BARBER
            </p>
            <h2 style={{ color: "#ffffff", marginTop: "4px", marginBottom: "8px", fontSize: "24px" }}>
              Đổi lịch hẹn
            </h2>
            <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 18px 0" }}>
              Mã: <b style={{ color: "#c6a15b" }}>{rescheduleDialog.appointment.appointmentCode}</b> · Khách: <b>{getUserName(rescheduleDialog.appointment.client)}</b>
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                padding: "16px",
                background: "#242320",
                borderRadius: "10px",
                border: "1px solid #3c3a34",
                marginBottom: "20px",
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#ddd", fontSize: "13px" }}>
                <span>Ngày hẹn mới</span>
                <input
                  type="date"
                  value={rescheduleDialog.appointmentDate}
                  onChange={(e) =>
                    setRescheduleDialog({
                      ...rescheduleDialog,
                      appointmentDate: e.target.value,
                    })
                  }
                  style={{
                    padding: "10px 12px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #4a473f",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#ddd", fontSize: "13px" }}>
                <span>Giờ bắt đầu mới</span>
                <input
                  type="time"
                  value={rescheduleDialog.startTime}
                  onChange={(e) =>
                    setRescheduleDialog({
                      ...rescheduleDialog,
                      startTime: e.target.value,
                    })
                  }
                  style={{
                    padding: "10px 12px",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #4a473f",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
              </label>
            </div>

            <p style={{ color: "#d8b272", fontSize: "12px", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              * Lưu ý: Hãy đảm bảo khách hàng đã đồng ý thời gian này trước khi bấm xác nhận cập nhật.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => setRescheduleDialog(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "1px solid #555",
                  background: "#292622",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => void handleConfirmReschedule()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#c6a15b",
                  color: "#111",
                  fontWeight: 700,
                  cursor: processingId ? "wait" : "pointer",
                }}
              >
                {processingId ? "Đang xử lý..." : "Xác nhận đổi lịch"}
              </button>
            </div>
          </section>
        </div>
      )}

      {serviceEditor && (
        <div className="appointment-modal-backdrop" onMouseDown={() => !processingId && setServiceEditor(null)}>
          <section className="appointment-modal appointment-services-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="appointment-modal-close"
              aria-label="Đóng"
              disabled={Boolean(processingId)}
              onClick={() => setServiceEditor(null)}
            >
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2>Thêm hoặc bớt dịch vụ</h2>
            <p className="appointment-service-editor-description">
              {serviceEditor.appointment.appointmentCode} · {getUserName(serviceEditor.appointment.client)}
            </p>

            <div className="appointment-service-editor-heading">
              <div>
                <strong>Dịch vụ đang sử dụng</strong>
                <span>Thứ tự bên dưới cũng là thứ tự thực hiện dịch vụ.</span>
              </div>
              <b>{serviceEditor.selectedIds.length} dịch vụ</b>
            </div>

            <div className="appointment-selected-services">
              {serviceEditor.selectedIds.map((serviceId, index) => {
                const service = services.find((item) => item.id === serviceId);
                if (!service) return null;

                return (
                  <article className="appointment-selected-service" key={service.id}>
                    <span className="appointment-service-order">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="appointment-service-editor-info">
                      <strong>{service.name}</strong>
                      <small>
                        {service.durationMinutes} phút · {formatMoney(service.price)}đ
                      </small>
                    </div>
                    <button
                      type="button"
                      title={`Bỏ ${service.name}`}
                      aria-label={`Bỏ ${service.name}`}
                      onClick={() => removeEditorService(service.id)}
                    >
                      ×
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="appointment-service-editor-heading appointment-available-heading">
              <div>
                <strong>Thêm dịch vụ</strong>
                <span>Chọn theo tên dịch vụ, không cần nhập mã ID.</span>
              </div>
            </div>

            <div className="appointment-available-services">
              {services
                .filter((service) => service.isActive && !serviceEditor.selectedIds.includes(service.id))
                .map((service) => (
                  <button
                    type="button"
                    className="appointment-available-service"
                    key={service.id}
                    onClick={() => addEditorService(service.id)}
                  >
                    <span className="appointment-service-add-icon">+</span>
                    <span className="appointment-service-editor-info">
                      <strong>{service.name}</strong>
                      <small>
                        {service.durationMinutes} phút · {formatMoney(service.price)}đ
                      </small>
                    </span>
                  </button>
                ))}
            </div>

            <div className="appointment-service-editor-total">
              <span>Tạm tính dịch vụ đã chọn</span>
              <strong>
                {formatMoney(
                  serviceEditor.selectedIds.reduce((total, serviceId) => {
                    const service = services.find((item) => item.id === serviceId);
                    return total + (service?.price ?? 0);
                  }, 0)
                )}đ
              </strong>
            </div>

            <div className="appointment-service-editor-actions">
              <button
                type="button"
                className="appointment-service-editor-cancel"
                disabled={Boolean(processingId)}
                onClick={() => setServiceEditor(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="appointment-service-editor-save"
                disabled={Boolean(processingId) || serviceEditor.selectedIds.length === 0}
                onClick={() => void saveEditorServices()}
              >
                {processingId ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </section>
        </div>
      )}

      {reopenForm && (
        <div className="appointment-modal-backdrop" onMouseDown={() => !processingId && setReopenForm(null)}>
          <section className="appointment-modal appointment-reopen-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="appointment-modal-close"
              onClick={() => setReopenForm(null)}
              disabled={Boolean(processingId)}
            >
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2>Bật lại lịch vắng mặt</h2>
            <p className="appointment-reopen-description">
              {reopenForm.appointment.appointmentCode} · {getUserName(reopenForm.appointment.client)}
            </p>

            <div className="appointment-reopen-options">
              <label>
                <input
                  type="radio"
                  name="reopen-mode"
                  checked={reopenForm.mode === "CHECK_IN"}
                  onChange={() => setReopenForm({ ...reopenForm, mode: "CHECK_IN" })}
                />
                <span>
                  <strong>Bật lại và check-in ngay</strong>
                  <small>Giữ khung giờ và Barber cũ. Hệ thống sẽ kiểm tra Barber còn rảnh.</small>
                </span>
              </label>

              <label>
                <input
                  type="radio"
                  name="reopen-mode"
                  checked={reopenForm.mode === "RESCHEDULE"}
                  onChange={() => setReopenForm({ ...reopenForm, mode: "RESCHEDULE" })}
                />
                <span>
                  <strong>Đặt lại lịch</strong>
                  <small>Chọn lại ngày, giờ và Barber; lịch sẽ trở về trạng thái đã xác nhận.</small>
                </span>
              </label>
            </div>

            {reopenForm.mode === "RESCHEDULE" && (
              <div className="appointment-reopen-grid">
                <label>
                  Ngày hẹn mới
                  <input
                    type="date"
                    value={reopenForm.appointmentDate}
                    onChange={(event) => setReopenForm({
                      ...reopenForm,
                      appointmentDate: event.target.value,
                    })}
                  />
                </label>

                <label>
                  Giờ bắt đầu mới
                  <input
                    type="time"
                    value={reopenForm.startTime}
                    onChange={(event) => setReopenForm({
                      ...reopenForm,
                      startTime: event.target.value,
                    })}
                  />
                </label>

                <label className="appointment-reopen-barber">
                  Barber
                  <select
                    value={reopenForm.barberId}
                    onChange={(event) => setReopenForm({
                      ...reopenForm,
                      barberId: event.target.value,
                    })}
                  >
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.fullName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="appointment-reopen-actions">
              <button
                type="button"
                className="appointment-reopen-cancel"
                disabled={Boolean(processingId)}
                onClick={() => setReopenForm(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="appointment-reopen-submit"
                disabled={Boolean(processingId)}
                onClick={() => void handleReopenNoShow()}
              >
                {processingId ? "Đang xử lý..." : "Xác nhận bật lại"}
              </button>
            </div>
          </section>
        </div>
      )}

      {receipt && (
        <div className="appointment-modal-backdrop">
          <section className="appointment-receipt">
            <h2>HÓA ĐƠN THADS BARBER</h2>
            <p>Mã lịch: <b>{receipt.appointment.appointmentCode}</b></p>
            <p>Khách hàng: {receipt.appointment.customer?.fullName}</p>
            <ul>
              {receipt.appointment.services.map((service, index) => (
                <li key={`${service.nameSnapshot}-${index}`}>
                  <span>{service.nameSnapshot}</span>
                  <b>{formatMoney(service.priceSnapshot)}đ</b>
                </li>
              ))}
            </ul>
            <h3>Tổng: {formatMoney(receipt.appointment.totalPrice)}đ</h3>
            {receipt.method === "BANK_TRANSFER" && (
              <img
                alt="QR chuyển khoản"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `THADS|${receipt.appointment.appointmentCode}|${receipt.appointment.totalPrice}`
                )}`}
              />
            )}
            <p>{receipt.method === "CASH" ? "Đã thanh toán tiền mặt" : "Đã thanh toán chuyển khoản"}</p>
            <div>
              <button type="button" onClick={() => window.print()}>In hóa đơn</button>
              <button type="button" onClick={() => setReceipt(null)}>Đóng</button>
            </div>
          </section>
        </div>
      )}

      {cancelDialog && (
        <div className="appointment-modal-backdrop" onMouseDown={() => !processingId && setCancelDialog(null)}>
          <section className="appointment-modal" style={{ maxWidth: "480px" }} onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="appointment-modal-close"
              aria-label="Đóng"
              disabled={Boolean(processingId)}
              onClick={() => setCancelDialog(null)}
            >
              ×
            </button>

            <p className="appointment-modal-brand">THADS BARBER</p>
            <h2 style={{ color: "#dc2626" }}>Xác nhận hủy lịch hẹn</h2>
            <p className="appointment-payment-description">
              Mã: <b>{cancelDialog.appointment.appointmentCode}</b> · Khách: <b>{getUserName(cancelDialog.appointment.client)}</b>
            </p>

            <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Lý do hủy
                </label>
                <select
                  value={cancelDialog.presetReason}
                  onChange={(e) => setCancelDialog({ ...cancelDialog, presetReason: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                >
                  <option value="Khách bận việc đột xuất">Khách bận việc đột xuất</option>
                  <option value="Khách không đến (Quá giờ hẹn)">Khách không đến (Quá giờ hẹn)</option>
                  <option value="Khách đổi ý sau khi Check-in">Khách đổi ý sau khi Check-in</option>
                  <option value="Barber có sự cố đột xuất">Barber có sự cố đột xuất</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Ghi chú chi tiết (không bắt buộc)
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập thêm chi tiết nếu cần..."
                  value={cancelDialog.reason}
                  onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => setCancelDialog(null)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => void handleConfirmCancel()}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#dc2626", color: "#fff", fontWeight: "600", cursor: "pointer" }}
              >
                {processingId ? "Đang hủy..." : "Xác nhận hủy lịch"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isReceptionistPage && (
        <BarberLeaveRegistrationModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          barbers={barbers}
          currentUser={user}
          isReceptionist={true}
          onSuccess={() => void loadAppointments()}
        />
      )}
    </div>
  );
}

export default Appointments;