import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import {
  getCatalogBarberById,
  getCatalogBarbers,
} from "../../services/catalog.service";
import { getApprovedBarberReviews } from "../../services/review.service";
import type { CatalogBarber } from "../../types/Catalog";
import type { PublicBarberReview } from "../../types/Review";
import "./css/PublicCatalog.css";

const stars = (value: number) =>
  "★★★★★".slice(0, Math.round(value)) + "☆☆☆☆☆".slice(0, 5 - Math.round(value));
export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState<CatalogBarber | null>(null),
    [reviews, setReviews] = useState<PublicBarberReview[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [dateModalOpen, setDateModalOpen] = useState(false),
    [selectedDate, setSelectedDate] = useState("");

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const continueBooking = () => {
    if (!barber || !selectedDate) return;
    navigate(
      `/booking?barberId=${encodeURIComponent(barber.id)}&appointmentDate=${encodeURIComponent(selectedDate)}`,
    );
  };
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const selected = id
          ? (await getCatalogBarberById(id)).barber
          : (await getCatalogBarbers()).barbers[0];
        if (!selected) throw new Error();
        if (!active) return;
        setBarber(selected);
        const response = await getApprovedBarberReviews(selected.id);
        if (active) setReviews(response.reviews);
      } catch {
        if (active) setError("Không thể tải thông tin Barber.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <div className="public-catalog-page">
      <ClientHeader />
      <header className="public-hero">
        <div>
          <small>CHUYÊN GIA TẠO KIỂU</small>
          <h1>{barber?.fullName || "Thông tin Barber"}</h1>
        </div>
      </header>
      <main className="public-section">
        {loading ? (
          <p className="public-loading">Đang tải...</p>
        ) : error || !barber ? (
          <p className="public-error">{error || "Không tìm thấy Barber."}</p>
        ) : (
          <>
            <section className="public-profile">
              <img
                src={barber.profile.avatar || "/img/team/team-detail.jpg"}
                alt={barber.fullName}
              />
              <div>
                <small>
                  {barber.profile.staffType === "CARE"
                    ? "Chuyên viên chăm sóc"
                    : "Barber chuyên nghiệp"}
                </small>
                <h1>{barber.fullName}</h1>
                <div className="public-rating">
                  {stars(barber.profile.averageRating)}{" "}
                  {barber.profile.averageRating.toFixed(1)}/5 (
                  {barber.profile.reviewCount} đánh giá)
                </div>
                <p>
                  {barber.profile.bio ||
                    `${barber.fullName} luôn chú trọng tay nghề, tư vấn phù hợp và trải nghiệm của khách hàng.`}
                </p>
                <p>
                  <b>Kinh nghiệm:</b> {barber.profile.experienceYears} năm
                </p>
                <p>
                  <b>Liên hệ:</b> {barber.email} · {barber.phone}
                </p>
                <div className="public-tags">
                  {barber.profile.specialties.map((s) => (
                    <span key={s._id}>{s.name}</span>
                  ))}
                </div>
                <div className="public-actions">
                  <button
                    type="button"
                    className="public-button"
                    onClick={() => setDateModalOpen(true)}
                  >
                    Đặt lịch với Barber
                  </button>
                  <Link className="public-button secondary" to="/team">
                    Quay lại đội ngũ
                  </Link>
                </div>
              </div>
            </section>
            <section>
              <h2>Đánh giá đã được duyệt ({reviews.length})</h2>
              {reviews.length ? (
                <div className="public-review-list">
                  {reviews.map((r) => (
                    <article className="public-review" key={r._id}>
                      <strong>{r.client?.fullName || "Khách hàng"}</strong>
                      <div className="public-rating">
                        {stars(r.barberRating)}
                      </div>
                      <p>
                        {r.barberComment || "Khách hàng không để lại nhận xét."}
                      </p>
                      <small>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </small>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="public-empty">
                  Barber này chưa có đánh giá được duyệt.
                </p>
              )}
            </section>
          </>
        )}
      </main>
      {dateModalOpen && barber && (
        <div
          className="public-date-modal"
          onMouseDown={() => setDateModalOpen(false)}
        >
          <section onMouseDown={(event) => event.stopPropagation()}>
            <small>ĐẶT LỊCH VỚI BARBER</small>
            <h2>{barber.fullName}</h2>
            <p>Chọn ngày trước khi chuyển sang trang đặt lịch.</p>
            <label>
              Ngày hẹn
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
            <div className="public-date-modal-actions">
              <button
                type="button"
                className="public-button secondary"
                onClick={() => setDateModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="public-button"
                disabled={!selectedDate}
                onClick={continueBooking}
              >
                Tiếp tục đặt lịch
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
