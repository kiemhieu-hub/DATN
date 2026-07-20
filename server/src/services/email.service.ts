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

export const sendBookingConfirmationEmail = async (
  input: BookingEmailInput
): Promise<void> => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("Chưa cấu hình SMTP, bỏ qua email xác nhận đặt lịch");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || `THADS Barber <${SMTP_USER}>`,
    to: input.to,
    subject: `Xác nhận lịch hẹn ${input.appointmentCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
        <h2>THADS Barber xác nhận đặt lịch</h2>
        <p>Xin chào <strong>${input.customerName}</strong>,</p>
        <p>Mã lịch hẹn: <strong>${input.appointmentCode}</strong></p>
        <p>Thời gian đặt: ${input.bookedAt.toLocaleString("vi-VN")}</p>
        <p>Thời gian sử dụng dịch vụ: <strong>${input.appointmentDate}, ${input.startTime} - ${input.endTime}</strong></p>
        <p>Vui lòng đến đúng giờ. Lịch chỉ có thể hủy trước giờ hẹn tối thiểu 6 tiếng.</p>
      </div>
    `,
  });
};
