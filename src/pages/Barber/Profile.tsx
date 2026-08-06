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
  getCatalogServices,
} from "../../services/catalog.service";

import {
  getMyBarberProfile,
  updateMyBarberProfile,
} from "../../services/barberProfile.service";

import type {
  BarberProfileData,
  UpdateBarberProfilePayload,
} from "../../types/BarberProfile";

import type {
  CatalogService,
  ServiceGroup,
} from "../../types/Catalog";

import "./css/Profile.css";

interface ServiceGroupSection {
  group: ServiceGroup;
  title: string;
}

const serviceGroups: ServiceGroupSection[] = [
  {
    group: "HAIRCUT",
    title: "Cắt tóc",
  },
  {
    group: "BEARD",
    title: "Chăm sóc râu",
  },
  {
    group: "CARE",
    title: "Chăm sóc",
  },
  {
    group: "COLOR",
    title: "Nhuộm tóc",
  },
  {
    group: "OTHER",
    title: "Dịch vụ khác",
  },
];

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

const createFormPayload = (
  data: BarberProfileData
): UpdateBarberProfilePayload => ({
  fullName:
    data.account.fullName ?? "",
  phone:
    data.account.phone ?? "",
  avatar:
    data.profile.avatar ||
    data.account.avatar ||
    "",
  bio:
    data.profile.bio ?? "",
  experienceYears:
    data.profile.experienceYears ?? 0,
  specialtyIds:
    data.profile.specialties.map(
      (service) => service.id
    ),
});

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [
    profileData,
    setProfileData,
  ] = useState<BarberProfileData | null>(
    null
  );

  const [
    services,
    setServices,
  ] = useState<CatalogService[]>([]);

  const [form, setForm] =
    useState<UpdateBarberProfilePayload>({
      fullName: "",
      phone: "",
      avatar: "",
      bio: "",
      experienceYears: 0,
      specialtyIds: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadData =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          servicesResponse,
        ] = await Promise.all([
          getMyBarberProfile(),
          getCatalogServices(),
        ]);

        setProfileData(
          profileResponse.data
        );

        setForm(
          createFormPayload(
            profileResponse.data
          )
        );

        setServices(
          servicesResponse.services
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải hồ sơ Barber."
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

    void loadData();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadData,
  ]);

  const groupedServices = useMemo(
    () =>
      serviceGroups.map(
        (group) => ({
          ...group,
          services:
            services.filter(
              (service) =>
                service.group ===
                group.group
            ),
        })
      ),
    [services]
  );

  const selectedServices = useMemo(
    () =>
      services.filter((service) =>
        form.specialtyIds.includes(
          service.id
        )
      ),
    [services, form.specialtyIds]
  );

  const handleFieldChange = <
    Key extends keyof UpdateBarberProfilePayload
  >(
    field: Key,
    value: UpdateBarberProfilePayload[Key]
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setMessage("");
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

    setError("");
    setMessage("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      form.fullName.trim().length < 2
    ) {
      setError(
        "Họ tên phải có ít nhất 2 ký tự."
      );
      return;
    }

    if (
      !/^(0|\+84)[0-9]{9,10}$/.test(
        form.phone.trim()
      )
    ) {
      setError(
        "Số điện thoại không hợp lệ."
      );
      return;
    }

    if (
      !Number.isInteger(
        form.experienceYears
      ) ||
      form.experienceYears < 0 ||
      form.experienceYears > 60
    ) {
      setError(
        "Số năm kinh nghiệm không hợp lệ."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateMyBarberProfile({
          ...form,
          fullName:
            form.fullName.trim(),
          phone:
            form.phone.trim(),
          avatar:
            form.avatar.trim(),
          bio:
            form.bio.trim(),
        });

      setProfileData(
        response.data
      );

      setForm(
        createFormPayload(
          response.data
        )
      );

      setMessage(response.message);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể cập nhật hồ sơ."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="barber-profile-page">
        <div className="barber-profile-loading">
          <div className="barber-profile-spinner" />
          <p>Đang tải hồ sơ...</p>
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
    <div className="barber-profile-page">
      <main className="barber-profile-container">
        <header className="barber-profile-header">
          <div>
            <p className="barber-profile-brand">
              THADS Barber
            </p>

            <h1>Hồ sơ Barber</h1>

            <p>
              Cập nhật thông tin cá nhân, kinh nghiệm
              và các dịch vụ chuyên môn.
            </p>
          </div>

          <div className="barber-profile-header-actions">
            <Link to="/barber/dashboard">
              Dashboard
            </Link>

            <Link to="/barber/schedule">
              Lịch hẹn
            </Link>
          </div>
        </header>

        {message && (
          <p className="barber-profile-message barber-profile-success">
            {message}
          </p>
        )}

        {error && (
          <div className="barber-profile-message barber-profile-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
            >
              Tải lại
            </button>
          </div>
        )}

        <form
          className="barber-profile-form"
          onSubmit={handleSubmit}
        >
          <aside className="barber-profile-preview">
            <div className="barber-profile-avatar">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={form.fullName}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  {form.fullName
                    .charAt(0)
                    .toUpperCase() || "B"}
                </span>
              )}
            </div>

            <h2>
              {form.fullName ||
                "Tên Barber"}
            </h2>

            <p>
              {form.experienceYears} năm
              kinh nghiệm
            </p>

            <div className="barber-profile-rating">
              <strong>
                {profileData?.profile
                  .averageRating
                  ? profileData.profile.averageRating.toFixed(
                      1
                    )
                  : "0.0"}
              </strong>

              <span>
                {
                  profileData?.profile
                    .reviewCount
                }{" "}
                đánh giá
              </span>
            </div>

            <div className="barber-profile-specialty-preview">
              <span>
                Chuyên môn đã chọn
              </span>

              {selectedServices.length ===
              0 ? (
                <p>
                  Chưa chọn dịch vụ chuyên môn.
                </p>
              ) : (
                <ul>
                  {selectedServices.map(
                    (service) => (
                      <li key={service.id}>
                        {service.name}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </aside>

          <section className="barber-profile-content">
            <div className="barber-profile-section">
              <div className="barber-profile-section-heading">
                <span>Thông tin tài khoản</span>
                <h2>Thông tin cá nhân</h2>
              </div>

              <div className="barber-profile-grid">
                <div className="barber-profile-field">
                  <label htmlFor="fullName">
                    Họ và tên
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    maxLength={100}
                    value={form.fullName}
                    onChange={(event) =>
                      handleFieldChange(
                        "fullName",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="barber-profile-field">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      profileData?.account
                        .email ?? ""
                    }
                    readOnly
                  />
                </div>

                <div className="barber-profile-field">
                  <label htmlFor="phone">
                    Số điện thoại
                  </label>

                  <input
                    id="phone"
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      handleFieldChange(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="barber-profile-field">
                  <label htmlFor="experienceYears">
                    Số năm kinh nghiệm
                  </label>

                  <input
                    id="experienceYears"
                    type="number"
                    min={0}
                    max={60}
                    value={
                      form.experienceYears
                    }
                    onChange={(event) =>
                      handleFieldChange(
                        "experienceYears",
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />
                </div>
              </div>

              <div className="barber-profile-field">
                <label htmlFor="avatar">
                  Đường dẫn ảnh đại diện
                </label>

                <input
                  id="avatar"
                  type="url"
                  placeholder="https://..."
                  value={form.avatar}
                  onChange={(event) =>
                    handleFieldChange(
                      "avatar",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="barber-profile-field">
                <label htmlFor="bio">
                  Giới thiệu bản thân
                </label>

                <textarea
                  id="bio"
                  rows={6}
                  maxLength={1000}
                  value={form.bio}
                  placeholder="Mô tả kinh nghiệm, phong cách và thế mạnh của bạn..."
                  onChange={(event) =>
                    handleFieldChange(
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
            </div>

            <div className="barber-profile-section">
              <div className="barber-profile-section-heading">
                <span>Dịch vụ chuyên môn</span>
                <h2>Chọn chuyên môn</h2>
                <p>
                  Các dịch vụ này sẽ được hiển thị
                  trong hồ sơ Barber.
                </p>
              </div>

              <div className="barber-profile-service-groups">
                {groupedServices.map(
                  (group) => {
                    if (
                      group.services.length ===
                      0
                    ) {
                      return null;
                    }

                    return (
                      <div
                        className="barber-profile-service-group"
                        key={group.group}
                      >
                        <h3>
                          {group.title}
                        </h3>

                        <div className="barber-profile-service-list">
                          {group.services.map(
                            (service) => {
                              const selected =
                                form.specialtyIds.includes(
                                  service.id
                                );

                              return (
                                <button
                                  key={service.id}
                                  type="button"
                                  className={
                                    selected
                                      ? "selected"
                                      : ""
                                  }
                                  onClick={() =>
                                    toggleSpecialty(
                                      service.id
                                    )
                                  }
                                >
                                  <span className="barber-profile-service-check">
                                    {selected
                                      ? "✓"
                                      : ""}
                                  </span>

                                  <span className="barber-profile-service-info">
                                    <strong>
                                      {
                                        service.name
                                      }
                                    </strong>

                                    <small>
                                      {service.priceFrom
                                        ? "Từ "
                                        : ""}
                                      {formatPrice(
                                        service.price
                                      )}
                                      đ
                                    </small>
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
              </div>
            </div>

            <div className="barber-profile-footer">
              <Link to="/barber/dashboard">
                Hủy thay đổi
              </Link>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : "Lưu hồ sơ"}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

export default Profile;