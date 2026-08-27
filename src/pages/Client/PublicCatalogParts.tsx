import { Link } from "react-router-dom";
import type {
  CatalogBarber,
  CatalogService,
  ServiceGroup,
} from "../../types/Catalog";

export const groupLabels: Record<ServiceGroup, string> = {
  HAIRCUT: "Cắt tóc",
  BEARD: "Râu và cạo mặt",
  COLOR: "Nhuộm tóc",
  CARE: "Chăm sóc tóc",
  OTHER: "Uốn và tạo kiểu",
};
export const money = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export function ServiceCard({ service }: { service: CatalogService }) {
  return (
    <article className="public-card">
      <img src={service.image || "/img/services/1.jpg"} alt={service.name} />
      <div className="public-card-body">
        <small>{groupLabels[service.group]}</small>
        <h2>{service.name}</h2>
        <p>
          {service.description || "Dịch vụ chuyên nghiệp tại THADS Barber."}
        </p>
        <div className="public-card-meta">
          <span>{service.durationMinutes} phút</span>
          <strong>
            {service.priceFrom ? "Từ " : ""}
            {money(service.price)}
          </strong>
        </div>
        <div className="public-actions">
          <Link
            className="public-button secondary"
            to={`/services-page/${service.id}`}
          >
            Chi tiết
          </Link>
          <Link
            className="public-button"
            to={`/booking?serviceId=${service.id}`}
          >
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BarberCard({ barber }: { barber: CatalogBarber }) {
  return (
    <article className="public-card">
      <img
        src={barber.profile.avatar || "/img/team/team-detail.jpg"}
        alt={barber.fullName}
      />
      <div className="public-card-body">
        <small>
          {barber.profile.staffType === "CARE"
            ? "Chuyên viên chăm sóc"
            : "Barber"}
        </small>
        <h2>{barber.fullName}</h2>
        <div className="public-rating">
          ★ {barber.profile.averageRating.toFixed(1)}{" "}
          <small>({barber.profile.reviewCount} đánh giá)</small>
        </div>
        <p>
          {barber.profile.bio ||
            `${barber.profile.experienceYears} năm kinh nghiệm.`}
        </p>
        <div className="public-actions">
          <Link
            className="public-button secondary"
            to={`/team-details/${barber.id}`}
          >
            Xem hồ sơ
          </Link>
          <Link className="public-button" to={`/booking?barberId=${barber.id}`}>
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}
