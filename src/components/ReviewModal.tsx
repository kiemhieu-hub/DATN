import { useMemo, useState, type FormEvent } from "react";
import { createReview } from "../services/review.service";
import type { Appointment } from "../types/Appointment";
import "./ReviewModal.css";

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (appointmentId: string, message: string) => void;
  onError: (message: string) => void;
}

const serviceId = (value: Appointment["services"][number]["service"]) =>
  typeof value === "string" ? value : value._id;

function RatingInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="client-review-stars" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={star <= value ? "selected" : ""}
          aria-label={`${star} sao`}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
      <span>{value}/5</span>
    </div>
  );
}

function ReviewModal({ appointment, onClose, onSuccess, onError }: Props) {
  const initialServices = useMemo(
    () => appointment.services.map((item) => ({
      serviceId: serviceId(item.service),
      name: item.nameSnapshot,
      rating: 5,
      comment: "",
    })),
    [appointment]
  );
  const [barberRating, setBarberRating] = useState(5);
  const [barberComment, setBarberComment] = useState("");
  const [services, setServices] = useState(initialServices);
  const [submitting, setSubmitting] = useState(false);

  const updateService = (
    index: number,
    field: "rating" | "comment",
    value: number | string
  ) => {
    setServices((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const response = await createReview({
        appointmentId: appointment._id,
        barberRating,
        barberComment: barberComment.trim(),
        serviceRatings: services.map(({ serviceId, rating, comment }) => ({
          serviceId,
          rating,
          comment: comment.trim(),
        })),
      });
      onSuccess(appointment._id, response.message);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Không thể gửi đánh giá")
          : "Không thể gửi đánh giá";
      onError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const barberName = typeof appointment.barber === "string"
    ? "Barber"
    : appointment.barber.fullName;

  return (
    <div className="client-review-backdrop" onMouseDown={onClose}>
      <form
        className="client-review-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => void submit(event)}
      >
        <button type="button" className="client-review-close" onClick={onClose}>×</button>
        <p className="client-review-eyebrow">CHIA SẺ TRẢI NGHIỆM</p>
        <h2>Đánh giá lịch hẹn</h2>
        <small>Mã lịch: {appointment.appointmentCode}</small>

        <section className="client-review-block">
          <div className="client-review-title">
            <strong>Barber {barberName}</strong>
            <RatingInput value={barberRating} onChange={setBarberRating} label="Đánh giá Barber" />
          </div>
          <textarea
            value={barberComment}
            onChange={(event) => setBarberComment(event.target.value)}
            maxLength={1000}
            placeholder="Nhận xét về tay nghề và thái độ phục vụ của Barber..."
          />
        </section>

        <h3>Đánh giá từng dịch vụ</h3>
        <div className="client-review-services">
          {services.map((item, index) => (
            <section className="client-review-block" key={item.serviceId}>
              <div className="client-review-title">
                <strong>{item.name}</strong>
                <RatingInput
                  value={item.rating}
                  onChange={(rating) => updateService(index, "rating", rating)}
                  label={`Đánh giá ${item.name}`}
                />
              </div>
              <textarea
                value={item.comment}
                onChange={(event) => updateService(index, "comment", event.target.value)}
                maxLength={1000}
                placeholder={`Nhận xét về dịch vụ ${item.name}...`}
              />
            </section>
          ))}
        </div>

        <p className="client-review-note">
          Đánh giá sẽ được hiển thị sau khi Admin kiểm duyệt.
        </p>
        <div className="client-review-actions">
          <button type="button" onClick={onClose}>Đóng</button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewModal;
