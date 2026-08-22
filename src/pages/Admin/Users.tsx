import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import {
  getAdminUserById,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminUser.service";

import type {
  AdminUser,
  AdminUserDetail,
  AdminUserPagination,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
} from "../../types/AdminUser";

import "./css/Users.css";

interface UserGroupState {
  items: AdminUser[];
  pagination: AdminUserPagination;
}

interface UserTableProps {
  title: string;
  description: string;
  role: AdminUserRole;
  group: UserGroupState;
  currentAdminId: string;
  processingId: string | null;
  onViewDetail: (userId: string) => void;
  onChangeStatus: (
    account: AdminUser,
    status: AdminUserStatus
  ) => void;
  onPageChange: (page: number) => void;
}

const roleLabels: Record<AdminUserRole, string> = {
  CLIENT: "Khách hàng",
  BARBER: "Barber",
  RECEPTIONIST: "Lễ tân",
  ADMIN: "Admin",
};

const statusLabels: Record<AdminUserStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BLOCKED: "Đã khóa",
};

const emptyPagination: AdminUserPagination = {
  page: 1,
  limit: 5,
  totalItems: 0,
  totalPages: 1,
};

const emptyGroup: UserGroupState = {
  items: [],
  pagination: emptyPagination,
};

const emptySummary: AdminUserSummary = {
  totalUsers: 0,
  totalClients: 0,
  totalBarbers: 0,
  totalReceptionists: 0,
  totalAdmins: 0,
  activeUsers: 0,
  blockedUsers: 0,
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "Chưa có";
  }

  return new Date(value).toLocaleString("vi-VN");
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string }
      | undefined;

    return data?.message || "Có lỗi xảy ra";
  }

  return "Có lỗi xảy ra";
};

function UserTable({
  title,
  description,
  role,
  group,
  currentAdminId,
  processingId,
  onViewDetail,
  onChangeStatus,
  onPageChange,
}: UserTableProps) {
  return (
    <section className={`admin-user-group admin-user-group-${role.toLowerCase()}`}>
      <header className="admin-user-group-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span>{group.pagination.totalItems} tài khoản</span>
      </header>

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Liên hệ</th>
              <th>Số lịch</th>
              <th>Tổng chi tiêu</th>
              <th>Đăng nhập gần nhất</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {group.items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="admin-users-empty"
                >
                  Không có tài khoản {roleLabels[role].toLowerCase()} phù hợp.
                </td>
              </tr>
            ) : (
              group.items.map((account) => (
                <tr key={account.id}>
                  <td>
                    <strong>{account.fullName}</strong>
                    <small>
                      Tạo: {formatDateTime(account.createdAt)}
                    </small>
                  </td>

                  <td>
                    <span>{account.phone}</span>
                    <small>{account.email}</small>
                  </td>

                  <td>{account.totalAppointments}</td>

                  <td className="admin-user-spent">
                    {role === "CLIENT"
                      ? `${formatMoney(account.totalSpent)}đ`
                      : "—"}
                  </td>

                  <td>{formatDateTime(account.lastLoginAt)}</td>

                  <td>
                    <span
                      className={`user-status ${account.status.toLowerCase()}`}
                    >
                      {statusLabels[account.status]}
                    </span>
                  </td>

                  <td>
                    <div className="admin-user-actions">
                      <button
                        type="button"
                        onClick={() => onViewDetail(account.id)}
                      >
                        Chi tiết
                      </button>

                      {account.id !== currentAdminId &&
                        account.status !== "BLOCKED" && (
                          <button
                            type="button"
                            className="danger"
                            disabled={processingId === account.id}
                            onClick={() =>
                              onChangeStatus(account, "BLOCKED")
                            }
                          >
                            Khóa
                          </button>
                        )}

                      {account.id !== currentAdminId &&
                        account.status === "BLOCKED" && (
                          <button
                            type="button"
                            className="success"
                            disabled={processingId === account.id}
                            onClick={() =>
                              onChangeStatus(account, "ACTIVE")
                            }
                          >
                            Mở khóa
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

      {group.pagination.totalPages > 1 && (
        <div className="admin-users-pagination">
          <button
            type="button"
            disabled={group.pagination.page <= 1}
            onClick={() =>
              onPageChange(group.pagination.page - 1)
            }
          >
            Trước
          </button>

          <span>
            Trang {group.pagination.page}/{group.pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              group.pagination.page >= group.pagination.totalPages
            }
            onClick={() =>
              onPageChange(group.pagination.page + 1)
            }
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function Users() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth("ADMIN");

  const [barberGroup, setBarberGroup] =
    useState<UserGroupState>(emptyGroup);

  const [receptionistGroup, setReceptionistGroup] =
    useState<UserGroupState>(emptyGroup);

  const [clientGroup, setClientGroup] =
    useState<UserGroupState>(emptyGroup);

  const [barberPage, setBarberPage] = useState(1);
  const [receptionistPage, setReceptionistPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);

  const [selectedUser, setSelectedUser] =
    useState<AdminUserDetail | null>(null);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] =
    useState("");

  const [status, setStatus] =
    useState<AdminUserStatus | "ALL">("ALL");

  const [summary, setSummary] =
    useState<AdminUserSummary>(emptySummary);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const commonParams = {
        keyword: submittedKeyword || undefined,
        status,
        limit: 5,
      };

      const [receptionistResponse, barberResponse, clientResponse] =
        await Promise.all([
          fetchBusinessQuery("admin-users", () => getAdminUsers({
            ...commonParams,
            role: "RECEPTIONIST",
            page: receptionistPage,
          }), { ...commonParams, role: "RECEPTIONIST", page: receptionistPage }),
          fetchBusinessQuery("admin-users", () => getAdminUsers({
            ...commonParams,
            role: "BARBER",
            page: barberPage,
          }), { ...commonParams, role: "BARBER", page: barberPage }),
          fetchBusinessQuery("admin-users", () => getAdminUsers({
            ...commonParams,
            role: "CLIENT",
            page: clientPage,
          }), { ...commonParams, role: "CLIENT", page: clientPage }),
        ]);

      setBarberGroup({
        items: barberResponse.items,
        pagination: barberResponse.pagination,
      });

      setReceptionistGroup({
        items: receptionistResponse.items,
        pagination: receptionistResponse.pagination,
      });

      setClientGroup({
        items: clientResponse.items,
        pagination: clientResponse.pagination,
      });

      setSummary(clientResponse.summary);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [
    submittedKeyword,
    status,
    barberPage,
    receptionistPage,
    clientPage,
  ]);

  useRealtimeRefresh(() => {
    void loadUsers();
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/admin/login", { replace: true });
      return;
    }

    void loadUsers();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadUsers,
  ]);

  const handleSearch = (event: FormEvent): void => {
    event.preventDefault();

    setReceptionistPage(1);
    setBarberPage(1);
    setClientPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  const handleStatusFilter = (
    newStatus: AdminUserStatus | "ALL"
  ): void => {
    setStatus(newStatus);
    setReceptionistPage(1);
    setBarberPage(1);
    setClientPage(1);
  };

  const openDetail = async (userId: string): Promise<void> => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await fetchBusinessQuery("admin-user-detail", () => getAdminUserById(userId), userId, 0);
      setSelectedUser(response.client);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatus = async (
    account: AdminUser,
    newStatus: AdminUserStatus
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Chuyển tài khoản “${account.fullName}” sang “${statusLabels[newStatus]}”?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(account.id);
      setError("");
      setMessage("");

      const response = await updateAdminUserStatus(
        account.id,
        newStatus
      );

      setMessage(response.message);
      await loadUsers();

      if (selectedUser?.id === account.id) {
        await openDetail(account.id);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: AdminUserRole
  ): Promise<void> => {
    if (!selectedUser || selectedUser.role === newRole) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn phân quyền tài khoản "${selectedUser.fullName}" sang "${roleLabels[newRole]}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);
      setError("");
      setMessage("");

      const response = await updateAdminUserRole(userId, newRole);

      setMessage(response.message || "Cập nhật vai trò thành công");
      await loadUsers();
      await openDetail(userId);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || (loading && summary.totalUsers === 0)) {
    return (
      <div className="admin-users-page">
        <p className="admin-users-loading">
          Đang tải danh sách người dùng...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-users-page">
      <main className="admin-users-container">
        <header className="admin-users-header">
          <div>
            <p className="admin-users-brand">THADS BARBER</p>
            <h1>Quản lý người dùng</h1>
            <p>
              Lễ tân, Barber và Client được phân tách thành các bảng quản lý riêng biệt.
            </p>
          </div>

          <nav>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/barbers">Barber</Link>
            <Link to="/admin/appointments">Lịch hẹn</Link>
            <Link to="/admin/payments">Thanh toán</Link>
          </nav>
        </header>

        {error && (
          <div className="admin-users-alert error">{error}</div>
        )}

        {message && (
          <div className="admin-users-alert success">{message}</div>
        )}

        <section className="admin-users-summary">
          <article><span>Tổng tài khoản</span><strong>{summary.totalUsers}</strong></article>
          <article><span>Barber</span><strong>{summary.totalBarbers}</strong></article>
          <article><span>Lễ tân</span><strong>{summary.totalReceptionists || 0}</strong></article>
          <article><span>Client</span><strong>{summary.totalClients}</strong></article>
          <article><span>Đang hoạt động</span><strong>{summary.activeUsers}</strong></article>
          <article><span>Đã khóa</span><strong>{summary.blockedUsers}</strong></article>
        </section>

        <form
          className="admin-users-filters admin-users-filters-separated"
          onSubmit={handleSearch}
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
          />

          <select
            value={status}
            onChange={(event) =>
              handleStatusFilter(
                event.target.value as AdminUserStatus | "ALL"
              )
            }
          >
            <option value="ALL">Tất cả trạng thái</option>

            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button type="submit">Tìm kiếm</button>
        </form>

        {loading && (
          <p className="admin-users-refreshing">
            Đang cập nhật dữ liệu...
          </p>
        )}

        <UserTable
          title="Tài khoản Lễ tân"
          description="Nhân viên xác nhận, check-in, điều phối lịch và thanh toán."
          role="RECEPTIONIST"
          group={receptionistGroup}
          currentAdminId={user.id}
          processingId={processingId}
          onViewDetail={(userId) => void openDetail(userId)}
          onChangeStatus={(account, newStatus) => void handleStatus(account, newStatus)}
          onPageChange={setReceptionistPage}
        />

        <UserTable
          title="Tài khoản Barber"
          description="Các thợ cắt tóc và tài khoản nghiệp vụ Barber."
          role="BARBER"
          group={barberGroup}
          currentAdminId={user.id}
          processingId={processingId}
          onViewDetail={(userId) => void openDetail(userId)}
          onChangeStatus={(account, newStatus) =>
            void handleStatus(account, newStatus)
          }
          onPageChange={setBarberPage}
        />

        <UserTable
          title="Tài khoản Client"
          description="Danh sách khách hàng đăng ký và sử dụng dịch vụ."
          role="CLIENT"
          group={clientGroup}
          currentAdminId={user.id}
          processingId={processingId}
          onViewDetail={(userId) => void openDetail(userId)}
          onChangeStatus={(account, newStatus) =>
            void handleStatus(account, newStatus)
          }
          onPageChange={setClientPage}
        />
      </main>

      {(selectedUser || detailLoading) && (
        <div
          className="admin-user-modal-backdrop"
          onMouseDown={() =>
            !detailLoading && setSelectedUser(null)
          }
        >
          <section
            className="admin-user-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {detailLoading || !selectedUser ? (
              <p>Đang tải chi tiết...</p>
            ) : (
              <>
                <button
                  type="button"
                  className="admin-user-modal-close"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>

                <p className="admin-user-modal-brand">THADS BARBER</p>
                <h2>{selectedUser.fullName}</h2>

                <div className="admin-user-detail-grid">
                  <p>
                    <span>Vai trò</span>
                    {selectedUser.role === "ADMIN" ? (
                      <strong>{roleLabels[selectedUser.role]}</strong>
                    ) : (
                      <select
                        value={selectedUser.role}
                        disabled={processingId === selectedUser.id}
                        onChange={(e) =>
                          void handleRoleChange(
                            selectedUser.id,
                            e.target.value as AdminUserRole
                          )
                        }
                        style={{
                          backgroundColor: "#1a1a1a",
                          color: "#ffffff",
                          border: "1px solid #333333",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="CLIENT">{roleLabels.CLIENT}</option>
                        <option value="RECEPTIONIST">{roleLabels.RECEPTIONIST}</option>
                        <option value="BARBER">{roleLabels.BARBER}</option>
                      </select>
                    )}
                  </p>
                  <p><span>Trạng thái</span><strong>{statusLabels[selectedUser.status]}</strong></p>
                  <p><span>Email</span><strong>{selectedUser.email}</strong></p>
                  <p><span>Số điện thoại</span><strong>{selectedUser.phone}</strong></p>
                  <p><span>Ngày tạo</span><strong>{formatDateTime(selectedUser.createdAt)}</strong></p>
                  <p><span>Lần đăng nhập cuối</span><strong>{formatDateTime(selectedUser.lastLoginAt)}</strong></p>
                  <p><span>Tổng lịch liên quan</span><strong>{selectedUser.totalAppointments}</strong></p>
                  <p><span>Tổng chi tiêu</span><strong>{formatMoney(selectedUser.totalSpent)}đ</strong></p>
                </div>

                {selectedUser.barberProfile && (
                  <div className="admin-user-barber-profile">
                    <h3>Hồ sơ Barber</h3>
                    <p>
                      {selectedUser.barberProfile.bio ||
                        "Chưa có giới thiệu"}
                    </p>
                    <strong>
                      {selectedUser.barberProfile.experienceYears} năm kinh nghiệm
                    </strong>
                    <div>
                      {selectedUser.barberProfile.specialties.map(
                        (service) => (
                          <span key={service._id}>{service.name}</span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <h3>Lịch hẹn gần đây</h3>

                <div className="admin-user-recent-list">
                  {selectedUser.recentAppointments.length === 0 ? (
                    <p>Chưa có lịch hẹn.</p>
                  ) : (
                    selectedUser.recentAppointments.map(
                      (appointment) => (
                        <article key={appointment._id}>
                          <span>
                            {appointment.appointmentDate} · {appointment.startTime}-{appointment.endTime}
                          </span>
                          <strong>
                            {formatMoney(appointment.totalPrice)}đ
                          </strong>
                          <small>{appointment.status}</small>
                        </article>
                      )
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Users;