import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import {
  getCatalogBarbers,
  getCatalogServices,
} from "../../services/catalog.service";
import "./css/PublicCatalog.css";

export default function About() {
  const [stats, setStats] = useState({ services: 0, barbers: 0, rating: 0 });
  useEffect(() => {
    void Promise.all([getCatalogServices(), getCatalogBarbers()])
      .then(([s, b]) => {
        const rating = b.barbers.length
          ? b.barbers.reduce((n, x) => n + x.profile.averageRating, 0) /
            b.barbers.length
          : 0;
        setStats({
          services: s.services.length,
          barbers: b.barbers.length,
          rating,
        });
      })
      .catch(() => undefined);
  }, []);
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>VỀ CHÚNG TÔI</small>
          <h1>Câu chuyện THADS Barber</h1>
          <p>
            Không gian chăm sóc tóc chuyên nghiệp, minh bạch lịch hẹn và tận tâm
            trong từng dịch vụ.
          </p>
        </div>
      </header>
      <main className="public-section">
        <section className="public-profile">
          <div>
            <small>CHUYÊN NGHIỆP VÀ TẬN TÂM</small>
            <h1>THADS Barber</h1>
            <p>
              THADS Barber giúp khách hàng chủ động chọn dịch vụ, Barber và
              khung giờ còn trống. Mỗi dịch vụ đều có giá, thời lượng và nhân
              viên chuyên môn rõ ràng.
            </p>
            <p>
              Hệ thống quản lý xuyên suốt từ đặt lịch, đặt cọc, thực hiện dịch
              vụ, thanh toán đến đánh giá, giúp trải nghiệm tại salon nhất quán
              và minh bạch.
            </p>
            <div className="public-actions">
              <Link className="public-button" to="/booking">
                Đặt lịch ngay
              </Link>
              <Link className="public-button secondary" to="/team">
                Xem đội ngũ
              </Link>
            </div>
          </div>
          <img src="/img/about.jpg" alt="THADS Barber" />
        </section>
        <section className="public-stats">
          <article>
            <strong>{stats.services}</strong>
            <span>Dịch vụ đang hoạt động</span>
          </article>
          <article>
            <strong>{stats.barbers}</strong>
            <span>Nhân viên chuyên môn</span>
          </article>
          <article>
            <strong>{stats.rating.toFixed(1)}★</strong>
            <span>Điểm trung bình Barber</span>
          </article>
        </section>
      </main>
    </div>
  );
}
