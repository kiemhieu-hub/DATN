import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import { getCatalogServices } from "../../services/catalog.service";
import type { CatalogService, ServiceGroup } from "../../types/Catalog";
import { groupLabels, money } from "./PublicCatalogParts";
import "./css/PublicCatalog.css";

export default function Pricing() {
  const [items, setItems] = useState<CatalogService[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    void getCatalogServices()
      .then((r) => setItems(r.services))
      .catch(() => setError("Không thể tải bảng giá."))
      .finally(() => setLoading(false));
  }, []);
  const grouped = useMemo(
    () =>
      Object.entries(groupLabels)
        .map(([key, label]) => ({
          key: key as ServiceGroup,
          label,
          items: items.filter((s) => s.group === key),
        }))
        .filter((g) => g.items.length),
    [items],
  );
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>DỊCH VỤ CHẤT LƯỢNG, GIÁ RÕ RÀNG</small>
          <h1>Bảng giá THADS Barber</h1>
          <p>Giá niêm yết đồng bộ với trang đặt lịch và quản lý dịch vụ.</p>
        </div>
      </header>
      <main className="public-section">
        {loading ? (
          <p className="public-loading">Đang tải bảng giá...</p>
        ) : error ? (
          <p className="public-error">{error}</p>
        ) : (
          <div className="public-price-groups">
            {grouped.map((g) => (
              <section className="public-price-group" key={g.key}>
                <h2>{g.label}</h2>
                {g.items.map((s) => (
                  <article className="public-price-row" key={s.id}>
                    <div className="public-price-info">
                      <strong>{s.name}</strong>
                      <span className="public-price-description">
                        {s.description ||
                          "Dịch vụ chuyên nghiệp tại THADS Barber."}
                      </span>
                    </div>
                    <span className="public-price-duration">
                      {s.durationMinutes} phút
                    </span>
                    <strong className="public-price-amount">
                      {s.priceFrom ? "Từ " : ""}
                      {money(s.price)}
                    </strong>
                    <Link
                      className="public-button public-price-booking"
                      to={`/booking?serviceId=${s.id}`}
                    >
                      Đặt lịch
                    </Link>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
