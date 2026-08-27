import { useEffect, useMemo, useState } from "react";
import ClientHeader from "../../components/ClientHeader";
import { getCatalogServices } from "../../services/catalog.service";
import type { CatalogService, ServiceGroup } from "../../types/Catalog";
import { groupLabels, ServiceCard } from "./PublicCatalogParts";
import "./css/PublicCatalog.css";

export default function Services() {
  const [items, setItems] = useState<CatalogService[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [group, setGroup] = useState<ServiceGroup | "ALL">("ALL"),
    [keyword, setKeyword] = useState("");
  useEffect(() => {
    void getCatalogServices()
      .then((r) => setItems(r.services))
      .catch(() => setError("Không thể tải dịch vụ."))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (s) =>
          (group === "ALL" || s.group === group) &&
          (!keyword.trim() ||
            `${s.name} ${s.description}`
              .toLowerCase()
              .includes(keyword.trim().toLowerCase())),
      ),
    [items, group, keyword],
  );
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>THADS BARBER MANG ĐẾN</small>
          <h1>Dịch vụ của chúng tôi</h1>
          <p>
            Dữ liệu dịch vụ, giá và thời lượng được cập nhật trực tiếp từ hệ
            thống quản trị.
          </p>
        </div>
      </header>
      <main className="public-section">
        <div className="public-toolbar">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm dịch vụ..."
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as ServiceGroup | "ALL")}
          >
            <option value="ALL">Tất cả nhóm</option>
            {Object.entries(groupLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="public-loading">Đang tải dịch vụ...</p>
        ) : error ? (
          <p className="public-error">{error}</p>
        ) : filtered.length ? (
          <section className="public-grid">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </section>
        ) : (
          <p className="public-empty">Không có dịch vụ phù hợp.</p>
        )}
      </main>
    </div>
  );
}
