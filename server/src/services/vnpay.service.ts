import crypto from "node:crypto";
import mongoose, { type HydratedDocument } from "mongoose";

import Appointment, { type IAppointment } from "../models/Appointment";
import Payment, { type PaymentPurpose } from "../models/Payment";
import AppError from "../utils/AppError";
import { recordAppointmentActivity } from "./appointmentActivity.service";
import { sendAppointmentLifecycleEmail } from "./email.service";
import { createStaffNotification } from "./staffNotification.service";

type VnpayParams = Record<string, string>;

const getConfig = () => {
  const tmnCode = process.env.VNP_TMN_CODE?.trim();
  const hashSecret = process.env.VNP_HASH_SECRET?.trim();
  if (!tmnCode || !hashSecret) {
    throw new AppError(
      "VNPay chưa được cấu hình. Vui lòng thêm VNP_TMN_CODE và VNP_HASH_SECRET.",
      503
    );
  }
  return {
    tmnCode,
    hashSecret,
    paymentUrl:
      process.env.VNP_URL?.trim() ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl:
      process.env.VNP_RETURN_URL?.trim() ||
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/vnpay-return`,
  };
};

const encode = (value: string): string =>
  encodeURIComponent(value).replace(/%20/g, "+");

const buildQuery = (params: VnpayParams): string =>
  Object.keys(params)
    .sort()
    .map((key) => `${encode(key)}=${encode(params[key] ?? "")}`)
    .join("&");

const sign = (params: VnpayParams, secret: string): string =>
  crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(buildQuery(params), "utf-8"))
    .digest("hex");

const formatVnpDate = (date: Date): string => {
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return [
    vietnamTime.getUTCFullYear(),
    String(vietnamTime.getUTCMonth() + 1).padStart(2, "0"),
    String(vietnamTime.getUTCDate()).padStart(2, "0"),
    String(vietnamTime.getUTCHours()).padStart(2, "0"),
    String(vietnamTime.getUTCMinutes()).padStart(2, "0"),
    String(vietnamTime.getUTCSeconds()).padStart(2, "0"),
  ].join("");
};

const normalizeIp = (ip: string): string =>
  ip.replace(/^::ffff:/, "") || "127.0.0.1";

const createTransactionCode = (): string =>
  `THADS${Date.now()}${crypto.randomInt(1000, 9999)}`;

const getPurposeAndAmount = (
  appointment: HydratedDocument<IAppointment> | null,
  requestedPurpose: "DEPOSIT" | "BALANCE"
): { purpose: PaymentPurpose; amount: number } => {
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);

  if (requestedPurpose === "DEPOSIT") {
    if (!appointment.depositRequired) {
      throw new AppError("Lịch hẹn này không yêu cầu đặt cọc", 400);
    }
    if (appointment.depositPaid) {
      throw new AppError("Tiền cọc đã được thanh toán", 409);
    }
    if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status)) {
      throw new AppError("Không thể thanh toán cọc cho lịch này", 400);
    }
    return { purpose: "DEPOSIT", amount: appointment.depositAmount };
  }

  if (!["IN_PROGRESS", "COMPLETED"].includes(appointment.status)) {
    throw new AppError(
      "Chỉ thanh toán hóa đơn khi lịch đang thực hiện hoặc đã hoàn thành",
      400
    );
  }
  if (appointment.paymentStatus === "PAID") {
    throw new AppError("Hóa đơn đã được thanh toán", 409);
  }
  const amount = Math.max(
    0,
    appointment.totalPrice - (appointment.depositPaid ? appointment.depositAmount : 0)
  );
  if (amount <= 0) {
    throw new AppError("Hóa đơn không còn số tiền cần thanh toán", 400);
  }
  return {
    purpose: appointment.depositPaid ? "BALANCE" : "FULL",
    amount,
  };
};

export const createVnpayPayment = async (input: {
  appointmentId: string;
  clientId: string;
  purpose: "DEPOSIT" | "BALANCE";
  ipAddress: string;
}) => {
  if (!mongoose.Types.ObjectId.isValid(input.appointmentId)) {
    throw new AppError("Mã lịch hẹn không hợp lệ", 400);
  }
  const appointment = await Appointment.findOne({
    _id: input.appointmentId,
    client: input.clientId,
  });
  const { purpose, amount } = getPurposeAndAmount(appointment, input.purpose);
  const config = getConfig();
  const transactionCode = createTransactionCode();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

  const params: VnpayParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(amount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: transactionCode,
    vnp_OrderInfo: `${purpose}-${appointment!.appointmentCode}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: normalizeIp(input.ipAddress),
    vnp_CreateDate: formatVnpDate(createdAt),
    vnp_ExpireDate: formatVnpDate(expiresAt),
  };
  const secureHash = sign(params, config.hashSecret);
  const paymentUrl = `${config.paymentUrl}?${buildQuery(params)}&vnp_SecureHash=${secureHash}`;

  const payment = await Payment.findOneAndUpdate(
    { appointment: appointment!._id, purpose },
    {
      $set: {
        client: appointment!.client,
        amount,
        method: "VNPAY",
        status: "PENDING",
        transactionCode,
        providerTransactionId: "",
        paymentUrl,
        paidAt: null,
        failedAt: null,
        failureReason: "",
        metadata: {
          requestedAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
      $setOnInsert: { appointment: appointment!._id, purpose },
    },
    { upsert: true, new: true, runValidators: true }
  );

  return {
    paymentUrl,
    transactionCode: payment.transactionCode,
    amount: payment.amount,
    purpose: payment.purpose,
  };
};

export const verifyVnpaySignature = (query: VnpayParams): boolean => {
  const config = getConfig();
  const receivedHash = query.vnp_SecureHash?.toLowerCase() || "";
  const signedParams = { ...query };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;
  const expectedHash = sign(signedParams, config.hashSecret);
  if (!receivedHash || receivedHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(receivedHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
};

export const processVnpayCallback = async (query: VnpayParams) => {
  if (!verifyVnpaySignature(query)) {
    return { rspCode: "97", message: "Chữ ký không hợp lệ", success: false };
  }

  const transactionCode = query.vnp_TxnRef || "";
  const payment = await Payment.findOne({ transactionCode });
  if (!payment) {
    return { rspCode: "01", message: "Không tìm thấy giao dịch", success: false };
  }
  const callbackAmount = Number(query.vnp_Amount || 0) / 100;
  if (callbackAmount !== payment.amount) {
    return { rspCode: "04", message: "Số tiền không hợp lệ", success: false };
  }
  if (payment.status === "PAID") {
    return { rspCode: "02", message: "Giao dịch đã được xác nhận", success: true, payment };
  }

  const successful =
    query.vnp_ResponseCode === "00" && query.vnp_TransactionStatus === "00";
  if (!successful) {
    payment.status = "FAILED";
    payment.failedAt = new Date();
    payment.failureReason = `VNPay response ${query.vnp_ResponseCode || "unknown"}`;
    payment.providerTransactionId = query.vnp_TransactionNo || "";
    payment.metadata = { ...payment.metadata, callback: query };
    await payment.save();
    return {
      rspCode: "00",
      message: "Đã ghi nhận giao dịch không thành công",
      success: false,
      payment,
    };
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const currentPayment = await Payment.findById(payment._id).session(session);
      if (!currentPayment || currentPayment.status === "PAID") return;
      const appointment = await Appointment.findById(currentPayment.appointment).session(session);
      if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);

      currentPayment.status = "PAID";
      currentPayment.paidAt = new Date();
      currentPayment.providerTransactionId = query.vnp_TransactionNo || "";
      currentPayment.metadata = {
        ...currentPayment.metadata,
        bankCode: query.vnp_BankCode,
        cardType: query.vnp_CardType,
        payDate: query.vnp_PayDate,
      };
      await currentPayment.save({ session });

      if (currentPayment.purpose === "DEPOSIT") {
        appointment.depositPaid = true;
        appointment.paymentStatus = "PENDING";
      } else {
        appointment.paymentStatus = "PAID";
      }
      await appointment.save({ session });

      await recordAppointmentActivity({
        appointmentId: appointment._id,
        action:
          currentPayment.purpose === "DEPOSIT"
            ? "DEPOSIT_CONFIRMED"
            : "PAYMENT_CONFIRMED",
        description:
          currentPayment.purpose === "DEPOSIT"
            ? `VNPay xác nhận đặt cọc ${currentPayment.amount.toLocaleString("vi-VN")}đ`
            : `VNPay xác nhận thanh toán ${currentPayment.amount.toLocaleString("vi-VN")}đ`,
        actorRole: "SYSTEM",
        metadata: {
          method: "VNPAY",
          amount: currentPayment.amount,
          purpose: currentPayment.purpose,
          transactionCode: currentPayment.transactionCode,
          providerTransactionId: currentPayment.providerTransactionId,
        },
        session,
      });
    });
  } finally {
    await session.endSession();
  }

  const paidPayment = await Payment.findById(payment._id).lean();
  const appointment = await Appointment.findById(payment.appointment).lean();
  if (paidPayment && appointment) {
    void sendAppointmentLifecycleEmail({
      event: paidPayment.purpose === "DEPOSIT" ? "DEPOSIT_PAID" : "PAID",
      to: appointment.customer.email,
      customerName: appointment.customer.fullName,
      appointmentCode: appointment.appointmentCode,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      services: appointment.services.map((service) => service.nameSnapshot),
      totalPrice: appointment.totalPrice,
      message: `VNPay đã xác nhận giao dịch ${paidPayment.transactionCode} thành công.`,
    }).catch(console.error);
    void createStaffNotification({
      title: paidPayment.purpose === "DEPOSIT" ? "Đã thanh toán cọc" : "Thanh toán thành công",
      message: `Lịch ${appointment.appointmentCode} đã thanh toán VNPay ${paidPayment.amount.toLocaleString("vi-VN")}đ.`,
      kind: "PAYMENT",
      appointmentId: appointment._id,
      dedupeKey: `VNPAY:${paidPayment.transactionCode}`,
    }).catch(console.error);
  }

  return {
    rspCode: "00",
    message: "Xác nhận giao dịch thành công",
    success: true,
    payment: paidPayment,
  };
};

export const getClientVnpayPaymentStatus = async (
  transactionCode: string,
  clientId: string
) => {
  const payment = await Payment.findOne({
    transactionCode,
    client: clientId,
  }).lean();
  if (!payment) throw new AppError("Không tìm thấy giao dịch", 404);
  return payment;
};
