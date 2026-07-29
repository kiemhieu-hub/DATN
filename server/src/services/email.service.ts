// Dùng require để dự án vẫn type-check trước khi cài package nodemailer mới.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer") as {
  createTransport: (options: Record<string, unknown>) => {
    sendMail: (options: Record<string, unknown>) => Promise<unknown>;
  };
};

interface BookingEmailInput {
  to: string;
  customerName: string;
  appointmentCode: string;
  bookedAt: Date;
  appointmentDate: string;
  startTime: string;
  endTime: string;
}

export type AppointmentEmailEvent =
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "BARBER_CHANGED"
  | "REOPENED"
  | "NO_SHOW"
  | "COMPLETED"
  | "PAID";

interface AppointmentLifecycleEmailInput {
  event: AppointmentEmailEvent;
  to: string;
  customerName: string;
  appointmentCode: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  barberName?: string;
  services?: string[];
  totalPrice?: number;
  message?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const emailTitles: Record<
  AppointmentEmailEvent,
  string
> = {
  CONFIRMED: "Lịch hẹn đã được xác nhận",
  CANCELLED: "Lịch hẹn đã được hủy",
  RESCHEDULED: "Lịch hẹn đã được đổi thời gian",
  BARBER_CHANGED: "Barber phụ trách đã được thay đổi",
  REOPENED: "Lịch hẹn đã được bật lại",
  NO_SHOW: "Lịch hẹn được ghi nhận vắng mặt",
  COMPLETED: "Dịch vụ đã hoàn thành",
  PAID: "Thanh toán thành công",
};

export const sendBookingConfirmationEmail = async (
  input: BookingEmailInput
): Promise<void> => {
  const { SMTP_USER, SMTP_FROM } = process.env;
  const transporter = getTransporter();

  if (!transporter || !SMTP_USER) {
    console.warn("Chưa cấu hình SMTP, bỏ qua email xác nhận đặt lịch");
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM || `THADS Barber <${SMTP_USER}>`,
    to: input.to,
    subject: `Xác nhận lịch hẹn ${input.appointmentCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
        <h2>THADS Barber xác nhận đặt lịch</h2>
        <p>Xin chào <strong>${escapeHtml(input.customerName)}</strong>,</p>
        <p>Mã lịch hẹn: <strong>${escapeHtml(input.appointmentCode)}</strong></p>
        <p>Thời gian đặt: ${input.bookedAt.toLocaleString("vi-VN")}</p>
        <p>Thời gian sử dụng dịch vụ: <strong>${escapeHtml(input.appointmentDate)}, ${escapeHtml(input.startTime)} - ${escapeHtml(input.endTime)}</strong></p>
        <p>Vui lòng đến đúng giờ. Lịch chỉ có thể hủy trước giờ hẹn tối thiểu 6 tiếng.</p>
      </div>
    `,
  });
};

export const sendAppointmentLifecycleEmail = async (
  input: AppointmentLifecycleEmailInput
): Promise<void> => {
  const { SMTP_USER, SMTP_FROM } = process.env;
  const transporter = getTransporter();

  if (!transporter || !SMTP_USER) {
    console.warn(
      `Chưa cấu hình SMTP, bỏ qua email ${input.event}`
    );
    return;
  }

  const title = emailTitles[input.event];
  const serviceRows =
    input.services?.length
      ? `
        <p><strong>Dịch vụ:</strong></p>
        <ul>
          ${input.services
            .map(
              (service) =>
                `<li>${escapeHtml(service)}</li>`
            )
            .join("")}
        </ul>
      `
      : "";
  const barberRow = input.barberName
    ? `<p><strong>Barber:</strong> ${escapeHtml(input.barberName)}</p>`
    : "";
  const totalRow =
    typeof input.totalPrice === "number"
      ? `<p><strong>Tổng tiền:</strong> ${input.totalPrice.toLocaleString("vi-VN")}đ</p>`
      : "";

  await transporter.sendMail({
    from:
      SMTP_FROM ||
      `THADS Barber <${SMTP_USER}>`,
    to: input.to,
    subject: `${title} - ${input.appointmentCode}`,
    html: `
      <div style="max-width:640px;margin:auto;padding:24px;font-family:Arial,sans-serif;color:#222;line-height:1.6;border:1px solid #ddd">
        <h2 style="margin-top:0;color:#9b7635">THADS BARBER</h2>
        <h3>${escapeHtml(title)}</h3>
        <p>Xin chào <strong>${escapeHtml(input.customerName)}</strong>,</p>
        ${input.message ? `<p>${escapeHtml(input.message)}</p>` : ""}
        <div style="padding:16px;background:#f6f3ed;border-left:4px solid #c6a15b">
          <p><strong>Mã lịch:</strong> ${escapeHtml(input.appointmentCode)}</p>
          <p><strong>Thời gian:</strong> ${escapeHtml(input.appointmentDate)} · ${escapeHtml(input.startTime)}–${escapeHtml(input.endTime)}</p>
          ${barberRow}
          ${serviceRows}
          ${totalRow}
        </div>
        <p>Nếu thông tin chưa chính xác, vui lòng liên hệ THADS Barber để được hỗ trợ.</p>
      </div>
    `,
  });
};
