import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  deleteAdminReview,
  getAdminReviews,
  updateAdminReviewStatus,
} from "../../services/adminReview.service";
import type { AdminReview, ReviewStatus } from "../../types/AdminReview";
import "./css/Reviews.css";

const statusLabels: Record<ReviewStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  HIDDEN: "Đã ẩn",
};

const getError = (error: unknown) =>
  axios.isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ??
      "Có lỗi xảy ra"
    : "Có lỗi xảy ra";

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const Stars = ({ value }: { value: number }) => (
  <span className="review-stars" aria-label={`${value} trên 5 sao`}>
    {Array.from({ length: 5 }, (_, index) => (
      <span className={index < value ? "filled" : ""} key={index}>★</span>
    ))}
  </span>
);

function Reviews() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "ALL">("ALL");
  const [rating, setRating] = useState<number | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<Record<ReviewStatus, number>>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    HIDDEN: 0,
  });
  const [detail, setDetail] = useState<AdminReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchBusinessQuery("admin-reviews", () => getAdminReviews({
        keyword: search || undefined,
        status,
        rating,
        page,
        limit: 10,
      }), {
        keyword: search || undefined,
        status,
        rating,
        page,
        limit: 10,
      });
      setItems(response.items);
      setTotalPages(response.pagination.totalPages);
      setSummary(response.summary);
    } catch (loadError) {
      setError(getError(loadError));
    } finally {
      setLoading(false);
    }
  }, [page, rating, search, status]);

  useRealtimeRefresh(() => {
    void loadReviews();
  });

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(keyword.trim());
  };

  const changeStatus = async (review: AdminReview, target: ReviewStatus) => {
    let note = "";
    if (target === "REJECTED" || target === "HIDDEN") {
      const input = window.prompt(
        target === "REJECTED" ? "Nhập lý do từ chối:" : "Nhập lý do ẩn review:"
      );
      if (input === null) return;
      if (!input.trim()) {
        setError("Lý do không được để trống");
        return;
      }
      note = input.trim();
    } else if (!window.confirm(`Chuyển review sang “${statusLabels[target]}”?`)) {
      return;
    }

    try {
      setProcessingId(review._id);
      setError("");
      setMessage("");
      const response = await updateAdminReviewStatus(review._id, target, note);
      setMessage(response.message);
      if (detail?._id === review._id) setDetail(response.review);
      await loadReviews();
    } catch (statusError) {
      setError(getError(statusError));
    } finally {
      setProcessingId(null);
    }
  };

  const removeReview = async (review: AdminReview) => {
    if (!window.confirm("Xóa vĩnh viễn review này? Dữ liệu không thể khôi phục.")) {
      return;
    }

    try {
      setProcessingId(review._id);
      setError("");
      const response = await deleteAdminReview(review._id);
      setMessage(response.message);
      if (detail?._id === review._id) setDetail(null);
      await loadReviews();
    } catch (deleteError) {
      setError(getError(deleteError));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="admin-reviews-page">
      <header className="admin-reviews-header">
        <p>PHẢN HỒI KHÁCH HÀNG</p>
        <h1>Quản lý review</h1>
        <span>Duyệt, ẩn và xử lý đánh giá của khách hàng.</span>
      </header>

      <div className="review-summary">
        {(Object.keys(statusLabels) as ReviewStatus[]).map((key) => (
          <button
            type="button"
            className={status === key ? "active" : ""}
            key={key}
            onClick={() => { setStatus(key); setPage(1); }}
          >
            <span>{statusLabels[key]}</span>
            <strong>{summary[key]}</strong>
          </button>
        ))}
      </div>

      {error && <div className="review-alert error">{error}</div>}
      {message && <div className="review-alert success">{message}</div>}

      <form className="review-filters" onSubmit={submitSearch}>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tên, email, SĐT hoặc nội dung review"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ReviewStatus | "ALL");
            setPage(1);
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          {(Object.entries(statusLabels) as Array<[ReviewStatus, string]>).map(
            ([key, label]) => <option value={key} key={key}>{label}</option>
          )}
        </select>
        <select
          value={rating}
          onChange={(event) => {
            setRating(event.target.value === "ALL" ? "ALL" : Number(event.target.value));
            setPage(1);
          }}
        >
          <option value="ALL">Tất cả số sao</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option value={star} key={star}>{star} sao</option>
          ))}
        </select>
        <button type="submit">Tìm kiếm</button>
      </form>

      <div className="review-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Barber</th>
              <th>Lịch hẹn</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="review-empty">Đang tải review...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="review-empty">Chưa có review phù hợp.</td></tr>
            ) : items.map((review) => (
              <tr key={review._id}>
                <td><strong>{review.client?.fullName ?? "Không xác định"}</strong><small>{review.client?.email}</small></td>
                <td>{review.barber?.fullName ?? "Không xác định"}</td>
                <td><strong>{review.appointment?.appointmentCode ?? "—"}</strong><small>{review.appointment?.appointmentDate}</small></td>
                <td><Stars value={review.overallRating} /><small>{review.barberComment || "Không có nhận xét"}</small></td>
                <td><span className={`review-status ${review.status.toLowerCase()}`}>{statusLabels[review.status]}</span></td>
                <td>{dateTime(review.createdAt)}</td>
                <td>
                  <div className="review-actions">
                    <button type="button" onClick={() => setDetail(review)}>Chi tiết</button>
                    {review.status !== "APPROVED" && <button type="button" className="approve" disabled={processingId === review._id} onClick={() => void changeStatus(review, "APPROVED")}>Duyệt</button>}
                    {review.status !== "REJECTED" && <button type="button" className="reject" disabled={processingId === review._id} onClick={() => void changeStatus(review, "REJECTED")}>Từ chối</button>}
                    {review.status === "APPROVED" && <button type="button" className="hide" disabled={processingId === review._id} onClick={() => void changeStatus(review, "HIDDEN")}>Ẩn</button>}
                    <button type="button" className="delete" disabled={processingId === review._id} onClick={() => void removeReview(review)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="review-pagination">
        <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button>
        <span>Trang {page}/{totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Sau</button>
      </div>

      {detail && (
        <div className="review-modal-bg" onMouseDown={() => setDetail(null)}>
          <article className="review-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="review-modal-close" onClick={() => setDetail(null)}>×</button>
            <p>CHI TIẾT REVIEW</p>
            <h2>{detail.client?.fullName}</h2>
            <div className="review-detail-grid">
              <div><span>Barber</span><strong>{detail.barber?.fullName}</strong></div>
              <div><span>Mã lịch hẹn</span><strong>{detail.appointment?.appointmentCode}</strong></div>
              <div><span>Điểm tổng thể</span><Stars value={detail.overallRating} /></div>
              <div><span>Điểm Barber</span><Stars value={detail.barberRating} /></div>
            </div>
            <h3>Nhận xét Barber</h3>
            <div className="review-comment">{detail.barberComment || "Không có nhận xét"}</div>
            <h3>Đánh giá dịch vụ</h3>
            <div className="review-service-list">
              {detail.serviceRatings.map((item, index) => (
                <div key={`${item.service?._id}-${index}`}>
                  <strong>{item.service?.name ?? "Dịch vụ"}</strong>
                  <Stars value={item.rating} />
                  <small>{item.comment || "Không có nhận xét"}</small>
                </div>
              ))}
            </div>
            {detail.moderationNote && <div className="review-moderation-note"><strong>Ghi chú kiểm duyệt:</strong> {detail.moderationNote}</div>}
          </article>
        </div>
      )}
    </section>
  );
}

export default Reviews;
