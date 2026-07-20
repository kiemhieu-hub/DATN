import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import {
  createAdminBarber,
  deleteAdminBarber,
  getAdminBarbers,
  resetAdminBarberPassword,
  updateAdminBarber,
  updateAdminBarberStatus,
} from "../../services/adminBarber.service";

import {
  getCatalogServices,
} from "../../services/catalog.service";

import type {
  AdminBarber,
  AdminBarberPagination,
  AdminBarberStatus,
  CreateAdminBarberPayload,
  UpdateAdminBarberPayload,
} from "../../types/AdminBarber";

import type {
  CatalogService,
} from "../../types/Catalog";

import "./css/Barbers.css";

type BarberStatusFilter =
  | AdminBarberStatus
  | "ALL";

interface BarberFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  specialtyIds: string[];
}

const emptyForm: BarberFormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  avatar: "",
  bio: "",
  experienceYears: 0,
  specialtyIds: [],
};

const statusLabels: Record<
  AdminBarberStatus,
  string
> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BLOCKED: "Đã khóa",
};

const formatDateTime = (
  value?: string | null
): string => {
  if (!value) {
    return "Chưa có";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

const formatPrice = (
  value: number
): string =>
  new Intl.NumberFormat("vi-VN").format(
    value
  );

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

const mapBarberToForm = (
  barber: AdminBarber
): BarberFormState => ({
  fullName: barber.fullName,
  email: barber.email,
  phone: barber.phone,
  password: "",
  avatar:
    barber.profile?.avatar ||
    barber.avatar ||
    "",
  bio:
    barber.profile?.bio || "",
  experienceYears:
    barber.profile?.experienceYears ??
    0,
  specialtyIds:
    barber.profile?.specialties.map(
      (service) => service.id
    ) ?? [],
});

function Barbers() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth("ADMIN");

  const [barbers, setBarbers] =
    useState<AdminBarber[]>([]);

  const [services, setServices] =
    useState<CatalogService[]>([]);

  const [pagination, setPagination] =
    useState<AdminBarberPagination>({
      page: 1,
      limit: 8,
      totalItems: 0,
      totalPages: 1,
    });

  const [keyword, setKeyword] =
    useState("");

  const [submittedKeyword, setSubmittedKeyword] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<BarberStatusFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingBarber, setEditingBarber] =
    useState<AdminBarber | null>(null);

  const [form, setForm] =
    useState<BarberFormState>(
      emptyForm
    );

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const loadBarbers =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminBarbers({
            keyword:
              submittedKeyword ||
              undefined,
            status: statusFilter,
            page: pagination.page,
            limit: pagination.limit,
          });

        setBarbers(response.items);
        setPagination(
          response.pagination
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải danh sách Barber."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      submittedKeyword,
      statusFilter,
      pagination.page,
      pagination.limit,
    ]);

  const loadServices =
    useCallback(async (): Promise<void> => {
      try {
        const response =
          await getCatalogServices();

        setServices(
          response.services
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải danh sách dịch vụ."
          )
        );
      }
    }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/admin/login", {
        replace: true,
        state: {
          message:
            "Bạn cần đăng nhập bằng tài khoản Admin.",
        },
      });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    void loadServices();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadServices,
  ]);

  useEffect(() => {
    if (
      !authLoading &&
      user?.role === "ADMIN"
    ) {
      void loadBarbers();
    }
  }, [
    authLoading,
    user,
    loadBarbers,
  ]);

  const selectedServices = useMemo(
    () =>
      services.filter((service) =>
        form.specialtyIds.includes(
          service.id
        )
      ),
    [services, form.specialtyIds]
  );

  const openCreateModal = (): void => {
    setEditingBarber(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (
    barber: AdminBarber
  ): void => {
    setEditingBarber(barber);
    setForm(
      mapBarberToForm(barber)
    );
    setMessage("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingBarber(null);
    setForm(emptyForm);
  };

  const updateForm = <
    Key extends keyof BarberFormState
  >(
    field: Key,
    value: BarberFormState[Key]
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleSpecialty = (
    serviceId: string
  ): void => {
    setForm((current) => ({
      ...current,
      specialtyIds:
        current.specialtyIds.includes(
          serviceId
        )
          ? current.specialtyIds.filter(
              (id) => id !== serviceId
            )
          : [
              ...current.specialtyIds,
              serviceId,
            ],
    }));
  };

  const validateForm = (): string => {
    if (
      form.fullName.trim().length < 2
    ) {
      return "Họ tên phải có ít nhất 2 ký tự.";
    }

    if (
      !/^(0|\+84)[0-9]{9,10}$/.test(
        form.phone.trim()
      )
    ) {
      return "Số điện thoại không hợp lệ.";
    }

    if (!editingBarber) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email
            .trim()
            .toLowerCase()
        )
      ) {
        return "Email không hợp lệ.";
      }

      if (form.password.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự.";
      }
    }

    if (
      !Number.isInteger(
        form.experienceYears
      ) ||
      form.experienceYears < 0 ||
      form.experienceYears > 60
    ) {
      return "Số năm kinh nghiệm không hợp lệ.";
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingBarber) {
        const payload: UpdateAdminBarberPayload =
          {
            fullName:
              form.fullName.trim(),
            phone:
              form.phone.trim(),
            avatar:
              form.avatar.trim(),
            bio:
              form.bio.trim(),
            experienceYears:
              form.experienceYears,
            specialtyIds:
              form.specialtyIds,
          };

        const response =
          await updateAdminBarber(
            editingBarber.id,
            payload
          );

        setMessage(
          response.message
        );
      } else {
        const payload: CreateAdminBarberPayload =
          {
            fullName:
              form.fullName.trim(),
            email:
              form.email
                .trim()
                .toLowerCase(),
            phone:
              form.phone.trim(),
            password:
              form.password,
            avatar:
              form.avatar.trim(),
            bio:
              form.bio.trim(),
            experienceYears:
              form.experienceYears,
            specialtyIds:
              form.specialtyIds,
          };

        const response =
          await createAdminBarber(
            payload
          );

        setMessage(
          response.message
        );
      }

      setIsModalOpen(false);
      setEditingBarber(null);
      setForm(emptyForm);

      await loadBarbers();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          editingBarber
            ? "Không thể cập nhật Barber."
            : "Không thể tạo Barber."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    barber: AdminBarber,
    status: AdminBarberStatus
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn chuyển ${barber.fullName} sang trạng thái "${statusLabels[status]}" không?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(barber.id);
      setError("");
      setMessage("");

      const response =
        await updateAdminBarberStatus(
          barber.id,
          {
            status,
          }
        );

      setMessage(response.message);

      setBarbers((current) =>
        current.map((item) =>
          item.id === barber.id
            ? response.barber
            : item
        )
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể cập nhật trạng thái Barber."
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (
    barber: AdminBarber
  ): Promise<void> => {
    const newPassword =
      window.prompt(
        `Nhập mật khẩu mới cho ${barber.fullName}:`,
        "123456"
      );

    if (newPassword === null) {
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Mật khẩu mới phải có ít nhất 6 ký tự."
      );
      return;
    }

    try {
      setProcessingId(barber.id);
      setError("");
      setMessage("");

      const response =
        await resetAdminBarberPassword(
          barber.id,
          {
            newPassword,
          }
        );

      setMessage(response.message);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể đặt lại mật khẩu Barber."
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteBarber = async (barber: AdminBarber): Promise<void> => {
    if (!window.confirm(`Xóa vĩnh viễn Barber “${barber.fullName}”? Hồ sơ và ca làm của Barber cũng sẽ bị xóa.`)) return;
    try {
      setProcessingId(barber.id);
      setError("");
      setMessage("");
      const response = await deleteAdminBarber(barber.id);
      setMessage(response.message);
      await loadBarbers();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể xóa Barber."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setPagination((current) => ({
      ...current,
      page: 1,
    }));

    setSubmittedKeyword(
      keyword.trim()
    );
  };

  const changePage = (
    page: number
  ): void => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    setPagination((current) => ({
      ...current,
      page,
    }));
  };

  if (authLoading) {
    return (
      <div className="admin-barbers-page">
        <div className="admin-barbers-loading">
          Đang kiểm tra tài khoản...
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  return (
    <div className="admin-barbers-page">
      <main className="admin-barbers-container">
        <header className="admin-barbers-header">
          <div>
            <p className="admin-barbers-brand">
              THADS Barber
            </p>

            <h1>Quản lý Barber</h1>

            <p>
              Tạo mới, cập nhật, khóa tài khoản
              và quản lý chuyên môn của Barber.
            </p>
          </div>

          <div className="admin-barbers-header-actions">
            <Link to="/admin/dashboard">
              Dashboard
            </Link>

            <button
              type="button"
              onClick={openCreateModal}
            >
              Thêm Barber
            </button>
          </div>
        </header>

        {message && (
          <p className="admin-barbers-message admin-barbers-success">
            {message}
          </p>
        )}

        {error && (
          <div className="admin-barbers-message admin-barbers-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                setError("");
                void loadBarbers();
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        <section className="admin-barbers-toolbar">
          <form
            className="admin-barbers-search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              value={keyword}
              onChange={(event) =>
                setKeyword(
                  event.target.value
                )
              }
            />

            <button type="submit">
              Tìm kiếm
            </button>
          </form>

          <div className="admin-barbers-filter">
            <label htmlFor="barberStatus">
              Trạng thái
            </label>

            <select
              id="barberStatus"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target
                    .value as BarberStatusFilter
                );

                setPagination(
                  (current) => ({
                    ...current,
                    page: 1,
                  })
                );
              }}
            >
              <option value="ALL">
                Tất cả
              </option>
              <option value="ACTIVE">
                Đang hoạt động
              </option>
              <option value="INACTIVE">
                Ngừng hoạt động
              </option>
              <option value="BLOCKED">
                Đã khóa
              </option>
            </select>
          </div>
        </section>

        <section className="admin-barbers-summary">
          <article>
            <span>Tổng kết quả</span>
            <strong>
              {pagination.totalItems}
            </strong>
          </article>

          <article>
            <span>Trang hiện tại</span>
            <strong>
              {pagination.page}/
              {pagination.totalPages}
            </strong>
          </article>

          <article>
            <span>Đang hoạt động</span>
            <strong>
              {
                barbers.filter(
                  (barber) =>
                    barber.status ===
                    "ACTIVE"
                ).length
              }
            </strong>
          </article>
        </section>

        {loading ? (
          <div className="admin-barbers-loading">
            Đang tải danh sách Barber...
          </div>
        ) : barbers.length === 0 ? (
          <section className="admin-barbers-empty">
            <h2>Không tìm thấy Barber</h2>
            <p>
              Hãy thay đổi bộ lọc hoặc thêm Barber mới.
            </p>
          </section>
        ) : (
          <section className="admin-barbers-grid">
            {barbers.map((barber) => (
              <article
                className="admin-barber-card"
                key={barber.id}
              >
                <div className="admin-barber-card-header">
                  <div className="admin-barber-avatar">
                    {barber.profile?.avatar ||
                    barber.avatar ? (
                      <img
                        src={
                          barber.profile
                            ?.avatar ||
                          barber.avatar
                        }
                        alt={barber.fullName}
                      />
                    ) : (
                      <span>
                        {barber.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="admin-barber-title">
                    <h2>
                      {barber.fullName}
                    </h2>

                    <span
                      className={`admin-barber-status status-${barber.status.toLowerCase()}`}
                    >
                      {
                        statusLabels[
                          barber.status
                        ]
                      }
                    </span>
                  </div>
                </div>

                <div className="admin-barber-contact">
                  <div>
                    <span>Email</span>
                    <strong>
                      {barber.email}
                    </strong>
                  </div>

                  <div>
                    <span>Số điện thoại</span>
                    <strong>
                      {barber.phone}
                    </strong>
                  </div>
                </div>

                <div className="admin-barber-metrics">
                  <div>
                    <span>Kinh nghiệm</span>
                    <strong>
                      {barber.profile
                        ?.experienceYears ??
                        0}{" "}
                      năm
                    </strong>
                  </div>

                  <div>
                    <span>Đánh giá</span>
                    <strong>
                      {barber.profile
                        ?.averageRating ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <span>Lượt đánh giá</span>
                    <strong>
                      {barber.profile
                        ?.reviewCount ??
                        0}
                    </strong>
                  </div>
                </div>

                <div className="admin-barber-bio">
                  <span>Giới thiệu</span>
                  <p>
                    {barber.profile?.bio ||
                      "Chưa có mô tả."}
                  </p>
                </div>

                <div className="admin-barber-specialties">
                  <span>Chuyên môn</span>

                  {barber.profile
                    ?.specialties.length ? (
                    <div>
                      {barber.profile.specialties
                        .slice(0, 5)
                        .map((service) => (
                          <small
                            key={
                              service.id
                            }
                          >
                            {service.name}
                          </small>
                        ))}

                      {barber.profile
                        .specialties.length >
                        5 && (
                        <small>
                          +
                          {barber.profile
                            .specialties
                            .length - 5}
                        </small>
                      )}
                    </div>
                  ) : (
                    <p>
                      Chưa chọn chuyên môn.
                    </p>
                  )}
                </div>

                <div className="admin-barber-meta">
                  <small>
                    Đăng nhập gần nhất:{" "}
                    {formatDateTime(
                      barber.lastLoginAt
                    )}
                  </small>

                  <small>
                    Ngày tạo:{" "}
                    {formatDateTime(
                      barber.createdAt
                    )}
                  </small>
                </div>

                <footer className="admin-barber-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(barber)
                    }
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    disabled={
                      processingId ===
                      barber.id
                    }
                    onClick={() =>
                      void handleResetPassword(
                        barber
                      )
                    }
                  >
                    Đặt lại mật khẩu
                  </button>

                  {barber.status ===
                  "ACTIVE" ? (
                    <button
                      type="button"
                      className="danger"
                      disabled={
                        processingId ===
                        barber.id
                      }
                      onClick={() =>
                        void handleStatusChange(
                          barber,
                          "BLOCKED"
                        )
                      }
                    >
                      Khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="success"
                      disabled={
                        processingId ===
                        barber.id
                      }
                      onClick={() =>
                        void handleStatusChange(
                          barber,
                          "ACTIVE"
                        )
                      }
                    >
                      Mở khóa
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger"
                    disabled={processingId === barber.id}
                    onClick={() => void handleDeleteBarber(barber)}
                  >
                    Xóa
                  </button>
                </footer>
              </article>
            ))}
          </section>
        )}

        <nav className="admin-barbers-pagination">
          <button
            type="button"
            disabled={
              pagination.page <= 1
            }
            onClick={() =>
              changePage(
                pagination.page - 1
              )
            }
          >
            Trang trước
          </button>

          <span>
            Trang {pagination.page} /{" "}
            {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              pagination.page >=
              pagination.totalPages
            }
            onClick={() =>
              changePage(
                pagination.page + 1
              )
            }
          >
            Trang sau
          </button>
        </nav>
      </main>

      {isModalOpen && (
        <div
          className="admin-barbers-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="admin-barbers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="barberModalTitle"
          >
            <header>
              <div>
                <span>
                  {editingBarber
                    ? "Cập nhật"
                    : "Tạo mới"}
                </span>

                <h2 id="barberModalTitle">
                  {editingBarber
                    ? "Sửa thông tin Barber"
                    : "Thêm Barber"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
            >
              <div className="admin-barbers-form-grid">
                <div className="admin-barbers-field">
                  <label htmlFor="barberFullName">
                    Họ và tên
                  </label>

                  <input
                    id="barberFullName"
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      updateForm(
                        "fullName",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-barbers-field">
                  <label htmlFor="barberPhone">
                    Số điện thoại
                  </label>

                  <input
                    id="barberPhone"
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-barbers-field">
                  <label htmlFor="barberEmail">
                    Email
                  </label>

                  <input
                    id="barberEmail"
                    type="email"
                    value={form.email}
                    readOnly={
                      Boolean(
                        editingBarber
                      )
                    }
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>

                {!editingBarber && (
                  <div className="admin-barbers-field">
                    <label htmlFor="barberPassword">
                      Mật khẩu
                    </label>

                    <input
                      id="barberPassword"
                      type="password"
                      value={
                        form.password
                      }
                      onChange={(event) =>
                        updateForm(
                          "password",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>
                )}

                <div className="admin-barbers-field">
                  <label htmlFor="barberExperience">
                    Số năm kinh nghiệm
                  </label>

                  <input
                    id="barberExperience"
                    type="number"
                    min={0}
                    max={60}
                    value={
                      form.experienceYears
                    }
                    onChange={(event) =>
                      updateForm(
                        "experienceYears",
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                  />
                </div>

                <div className="admin-barbers-field">
                  <label htmlFor="barberAvatar">
                    URL ảnh đại diện
                  </label>

                  <input
                    id="barberAvatar"
                    type="url"
                    placeholder="https://..."
                    value={form.avatar}
                    onChange={(event) =>
                      updateForm(
                        "avatar",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-barbers-field">
                <label htmlFor="barberBio">
                  Giới thiệu
                </label>

                <textarea
                  id="barberBio"
                  rows={5}
                  maxLength={1000}
                  value={form.bio}
                  onChange={(event) =>
                    updateForm(
                      "bio",
                      event.target.value
                    )
                  }
                />

                <small>
                  {form.bio.length}/1000
                  ký tự
                </small>
              </div>

              <div className="admin-barbers-specialty-picker">
                <div>
                  <span>
                    Chuyên môn
                  </span>

                  <small>
                    Đã chọn{" "}
                    {
                      selectedServices.length
                    }{" "}
                    dịch vụ
                  </small>
                </div>

                <section>
                  {services.map(
                    (service) => {
                      const selected =
                        form.specialtyIds.includes(
                          service.id
                        );

                      return (
                        <button
                          type="button"
                          className={
                            selected
                              ? "selected"
                              : ""
                          }
                          key={
                            service.id
                          }
                          onClick={() =>
                            toggleSpecialty(
                              service.id
                            )
                          }
                        >
                          <span>
                            {selected
                              ? "✓"
                              : ""}
                          </span>

                          <div>
                            <strong>
                              {
                                service.name
                              }
                            </strong>

                            <small>
                              {formatPrice(
                                service.price
                              )}
                              đ
                            </small>
                          </div>
                        </button>
                      );
                    }
                  )}
                </section>
              </div>

              <footer>
                <button
                  type="button"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingBarber
                      ? "Lưu thay đổi"
                      : "Tạo Barber"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Barbers;
