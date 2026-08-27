import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import { getCatalogServices } from "../../services/catalog.service";
import type { CatalogService } from "../../types/Catalog";
import { groupLabels, money, ServiceCard } from "./PublicCatalogParts";
import "./css/PublicCatalog.css";

export default function ServicesPage() {
  const { id } = useParams();
  const [items, setItems] = useState<CatalogService[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    void getCatalogServices()
      .then((r) => setItems(r.services))
      .catch(() => setError("Không thể tải chi tiết dịch vụ."))
      .finally(() => setLoading(false));
  }, []);
  const service = id ? items.find((s) => s.id === id) : items[0];
  const related = service
    ? items
        .filter((s) => s.id !== service.id && s.group === service.group)
        .slice(0, 3)
    : [];
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>CHI TIẾT DỊCH VỤ</small>
          <h1>{service?.name || "Dịch vụ THADS Barber"}</h1>
        </div>
      </header>
      <main className="public-section">
        {loading ? (
          <p className="public-loading">Đang tải...</p>
        ) : error ? (
          <p className="public-error">{error}</p>
        ) : !service ? (
          <p className="public-empty">Không tìm thấy dịch vụ.</p>
        ) : (
          <>
            <section className="public-profile">
              <img
                src={service.image || "/img/services/1.jpg"}
                alt={service.name}
              />
              <div>
                <small>{groupLabels[service.group]}</small>
                <h1>{service.name}</h1>
                <p>
                  {service.description ||
                    "Dịch vụ được thực hiện theo quy trình chuyên nghiệp tại THADS Barber."}
                </p>
                <div className="public-stats">
                  <article>
                    <strong>{service.durationMinutes}</strong>
                    <span>phút</span>
                  </article>
                  <article>
                    <strong>{money(service.price)}</strong>
                    <span>{service.priceFrom ? "Giá từ" : "Giá niêm yết"}</span>
                  </article>
                  <article>
                    <strong>
                      {service.staffType === "HAIR" ? "Barber" : "Care"}
                    </strong>
                    <span>Nhân viên thực hiện</span>
                  </article>
                </div>
                <div className="public-actions">
                  <Link
                    className="public-button"
                    to={`/booking?serviceId=${service.id}`}
                  >
                    Đặt dịch vụ này
                  </Link>
                  <Link className="public-button secondary" to="/services">
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </section>
            {related.length > 0 && (
              <section>
                <h2>Dịch vụ liên quan</h2>
                <div className="public-grid">
                  {related.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
