import { useEffect, useMemo, useState } from "react";
import ClientHeader from "../../components/ClientHeader";
import { getCatalogBarbers } from "../../services/catalog.service";
import type { CatalogBarber, ServiceStaffType } from "../../types/Catalog";
import { BarberCard } from "./PublicCatalogParts";
import "./css/PublicCatalog.css";

export default function Team() {
  const [items, setItems] = useState<CatalogBarber[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [type, setType] = useState<ServiceStaffType | "ALL">("ALL");
  useEffect(() => {
    void getCatalogBarbers()
      .then((r) => setItems(r.barbers))
      .catch(() => setError("Không thể tải đội ngũ Barber."))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(
    () => items.filter((b) => type === "ALL" || b.profile.staffType === type),
    [items, type],
  );
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>ĐỘI NGŨ CHUYÊN NGHIỆP</small>
          <h1>Barber tại THADS Barber</h1>
          <p>
            Chọn chuyên gia theo tay nghề, dịch vụ chuyên môn và đánh giá thực
            tế.
          </p>
        </div>
      </header>
      <main className="public-section">
        <div className="public-toolbar">
          <strong>{filtered.length} nhân viên đang hoạt động</strong>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as ServiceStaffType | "ALL")
            }
          >
            <option value="ALL">Tất cả nhân viên</option>
            <option value="HAIR">Barber làm tóc</option>
            <option value="CARE">Nhân viên chăm sóc</option>
          </select>
        </div>
        {loading ? (
          <p className="public-loading">Đang tải...</p>
        ) : error ? (
          <p className="public-error">{error}</p>
        ) : filtered.length ? (
          <section className="public-grid">
            {filtered.map((b) => (
              <BarberCard key={b.id} barber={b} />
            ))}
          </section>
        ) : (
          <p className="public-empty">Chưa có nhân viên phù hợp.</p>
        )}
      </main>
    </div>
  );
}
