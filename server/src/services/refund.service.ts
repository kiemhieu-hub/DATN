import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import Payment from "../models/Payment";
import Refund, { type RefundStatus } from "../models/Refund";
import AppError from "../utils/AppError";
import { recordAppointmentActivity } from "./appointmentActivity.service";
import { writeAuditLog } from "./auditLog.service";

export const createRefundRequestForAppointment = async (
  appointmentId: string,
  requestedBy: string,
  actorRole: "CLIENT" | "ADMIN" | "RECEPTIONIST"
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError("Không tìm thấy lịch hẹn", 404);

  const amount = appointment.cancellation?.refundAmount
    ?? appointment.cancellation?.depositRefundAmount
    ?? 0;

  if (amount <= 0) return null;

  const existing = await Refund.findOne({
    appointment: appointmentId,
    status: { $in: ["PENDING", "PROCESSING", "REFUNDED", "REFUNDED_MANUAL"] },
  });
  if (existing) return existing;

  const payment = await Payment.findOne({
    appointment: appointmentId,
    status: "PAID",
  }).sort({ paidAt: -1 });

  const refund = await Refund.create({
    appointment: appointmentId,
    payment: payment?._id,
    amount,
    reason: appointment.cancellation?.reason || "Hoàn cọc lịch hẹn",
    method: payment?.method === "VNPAY" ? "VNPAY" : "BANK_TRANSFER",
    requestedBy,
    requestedAt: new Date(),
  });

  appointment.cancellation = {
    ...appointment.cancellation!,
    refundStatus: "PENDING",
  };
  await appointment.save();

  await writeAuditLog({
    actorId: requestedBy,
    actorRole,
    action: "REFUND_REQUESTED",
    entityType: "Refund",
    entityId: String(refund._id),
    after: { amount, status: "PENDING" },
  });

  return refund;
};

interface ProcessRefundInput {
  refundId: string;
  actorId: string;
  actorRole: "ADMIN" | "RECEPTIONIST";
  status: Extract<RefundStatus, "REFUNDED_MANUAL" | "REJECTED" | "FAILED">;
  bankReference?: string;
  proofImage?: string;
  failureReason?: string;
}

export const processRefund = async (input: ProcessRefundInput) => {
  if (!mongoose.Types.ObjectId.isValid(input.refundId)) {
    throw new AppError("Mã hoàn tiền không hợp lệ", 400);
  }

  const refund = await Refund.findById(input.refundId);
  if (!refund) throw new AppError("Không tìm thấy yêu cầu hoàn tiền", 404);
  if (!["PENDING", "PROCESSING", "FAILED"].includes(refund.status)) {
    throw new AppError("Yêu cầu hoàn tiền đã được xử lý", 409);
  }

  if (input.status === "REFUNDED_MANUAL" && !input.bankReference?.trim()) {
    throw new AppError("Vui lòng nhập mã giao dịch ngân hàng", 400);
  }

  refund.status = input.status;
  refund.processedBy = new mongoose.Types.ObjectId(input.actorId);
  refund.bankReference = input.bankReference?.trim() ?? "";
  refund.proofImage = input.proofImage?.trim() ?? "";
  refund.failureReason = input.failureReason?.trim() ?? "";
  refund.completedAt = input.status === "REFUNDED_MANUAL" ? new Date() : undefined;
  await refund.save();

  const appointment = await Appointment.findById(refund.appointment);
  if (appointment?.cancellation) {
    appointment.cancellation.refundStatus =
      input.status === "REFUNDED_MANUAL" ? "REFUNDED" : "FAILED";
    appointment.cancellation.depositRefundStatus =
      input.status === "REFUNDED_MANUAL" ? "REFUNDED" : "ELIGIBLE";
    if (input.status === "REFUNDED_MANUAL") appointment.paymentStatus = "REFUNDED";
    await appointment.save();

    await recordAppointmentActivity({
      appointmentId: appointment._id,
      action: "REFUND_UPDATED",
      description:
        input.status === "REFUNDED_MANUAL"
          ? `Đã hoàn ${refund.amount.toLocaleString("vi-VN")}đ, mã ${refund.bankReference}`
          : `Yêu cầu hoàn tiền chuyển sang ${input.status}`,
      actorId: input.actorId,
      actorRole: input.actorRole,
      metadata: { refundId: String(refund._id), status: input.status },
    });
  }

  await writeAuditLog({
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: "REFUND_UPDATED",
    entityType: "Refund",
    entityId: String(refund._id),
    after: { status: input.status, bankReference: refund.bankReference },
  });

  return refund.populate([
    { path: "appointment", select: "appointmentCode customer totalPrice depositAmount" },
    { path: "payment", select: "transactionCode providerTransactionId method amount" },
  ]);
};

export const listRefunds = async () =>
  Refund.find()
    .populate("appointment", "appointmentCode customer totalPrice depositAmount cancellation")
    .populate("payment", "transactionCode providerTransactionId method amount")
    .populate("requestedBy processedBy", "fullName email role")
    .sort({ createdAt: -1 })
    .lean();

