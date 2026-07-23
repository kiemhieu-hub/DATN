import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import Payment from "../models/Payment";
import AppError from "../utils/AppError";
import User from "../models/User";
import { recordAppointmentActivity } from "./appointmentActivity.service";
import { sendAppointmentLifecycleEmail } from "./email.service";

interface GetPaymentsInput {
  keyword?: string;
  status?: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "ALL";
  method?: "CASH" | "VNPAY" | "MOMO" | "BANK_TRANSFER" | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const populatePayment = (query: any) => {
  return query
    .populate("client", "fullName email phone")
    .populate({
      path: "appointment",
      select:
        "client barber services totalPrice durationMinutes appointmentDate startTime endTime status paymentStatus note",
      populate: [
        {
          path: "barber",
          select: "fullName email phone",
        },
        {
          path: "services.service",
          select: "name group image",
        },
      ],
    });
};

const createTransactionCode = (): string => {
  const time = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `CASH-${time}-${random}`;
};

export const confirmCashPayment = async (
  appointmentId: string,
  adminId: string,
  method: "CASH" | "BANK_TRANSFER" = "CASH",
  actorRole: "ADMIN" | "RECEPTIONIST" = "ADMIN"
) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new AppError("Mã lịch hẹn không hợp lệ", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new AppError("Tài khoản Admin không hợp lệ", 400);
  }

  const session = await mongoose.startSession();

  try {
    let createdPaymentId = "";

    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(
        appointmentId
      ).session(session);

      if (!appointment) {
        throw new AppError("Không tìm thấy lịch hẹn", 404);
      }

      if (
        !["IN_PROGRESS", "COMPLETED"].includes(
          appointment.status
        )
      ) {
        throw new AppError(
          "Chỉ thanh toán khi lịch đang thực hiện hoặc đã hoàn thành",
          400
        );
      }

      if (appointment.paymentStatus === "PAID") {
        throw new AppError("Lịch hẹn đã được thanh toán", 409);
      }

      const existingPayment = await Payment.findOne({
        appointment: appointmentId,
        status: "PAID",
      }).session(session);

      if (existingPayment) {
        throw new AppError("Lịch hẹn đã có giao dịch thanh toán", 409);
      }

      const [payment] = await Payment.create(
        [
          {
            appointment: appointment._id,
            client: appointment.client,
            amount: appointment.totalPrice,
            method,
            status: "PAID",
            transactionCode: `${method === "CASH" ? "CASH" : "BANK"}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            paidAt: new Date(),
            metadata: {
              confirmedBy: adminId,
              confirmedByRole: "ADMIN_OR_RECEPTIONIST",
            },
          },
        ],
        { session }
      );

      if (!payment) {
        throw new AppError("Không thể tạo giao dịch thanh toán", 500);
      }

      appointment.paymentStatus = "PAID";
      await appointment.save({ session });
      await recordAppointmentActivity({
        appointmentId: appointment._id,
        action: "PAYMENT_CONFIRMED",
        description:
          method === "CASH"
            ? `Đã xác nhận thanh toán tiền mặt ${appointment.totalPrice.toLocaleString("vi-VN")}đ`
            : `Đã xác nhận chuyển khoản ${appointment.totalPrice.toLocaleString("vi-VN")}đ`,
        actorId: adminId,
        actorRole,
        metadata: {
          method,
          amount: appointment.totalPrice,
          paymentStatus: "PAID",
          transactionCode: payment.transactionCode,
        },
        session,
      });

      createdPaymentId = String(payment._id);
    });

    const payment = await Payment.findById(createdPaymentId)
      .populate(
        "appointment",
        "appointmentDate startTime endTime services totalPrice status paymentStatus"
      )
      .populate(
        "client",
        "fullName email phone"
      )
      .lean();

    if (!payment) {
      throw new AppError("Không tìm thấy giao dịch vừa tạo", 404);
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("client", "fullName email phone role status")
      .populate("barber", "fullName email phone role status")
      .populate("services.service", "name image group isActive")
      .lean();

    if (appointment) {
      const barberName =
        typeof appointment.barber === "object" &&
        appointment.barber &&
        "fullName" in appointment.barber
          ? String(appointment.barber.fullName)
          : undefined;

      void sendAppointmentLifecycleEmail({
        event: "PAID",
        to: appointment.customer.email,
        customerName:
          appointment.customer.fullName,
        appointmentCode:
          appointment.appointmentCode,
        appointmentDate:
          appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        barberName,
        services:
          appointment.services.map(
            (service) =>
              service.nameSnapshot
          ),
        totalPrice:
          appointment.totalPrice,
        message:
          method === "CASH"
            ? "THADS Barber đã xác nhận thanh toán tiền mặt thành công."
            : "THADS Barber đã xác nhận thanh toán chuyển khoản thành công.",
      }).catch((error: unknown) => {
        console.error(
          "Không thể gửi email thanh toán:",
          error
        );
      });
    }

    return {
      payment,
      appointment,
    };
  } finally {
    await session.endSession();
  }
};

export const getPaymentByAppointment = async (
  appointmentId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new AppError("Mã lịch hẹn không hợp lệ", 400);
  }

  const payment = await Payment.findOne({
    appointment: appointmentId,
    status: "PAID",
  })
    .populate(
      "appointment",
      "appointmentDate startTime endTime services totalPrice status paymentStatus"
    )
    .populate("client", "fullName email phone")
    .lean();

  if (!payment) {
    throw new AppError("Lịch hẹn chưa được thanh toán", 404);
  }

  return payment;
};

export const getAdminPayments = async (
  input: GetPaymentsInput
) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(input.limit) || 10)
  );

  const filter: Record<string, unknown> = {};

  if (input.status && input.status !== "ALL") {
    filter.status = input.status;
  }

  if (input.method && input.method !== "ALL") {
    filter.method = input.method;
  }

  if (input.keyword?.trim()) {
    const keyword = input.keyword.trim();
    const regex = new RegExp(keyword, "i");

    const clients = await User.find({
      $or: [
        { fullName: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select("_id")
      .lean();

    filter.$or = [
      {
        transactionCode: regex,
      },
      {
        client: {
          $in: clients.map((client) => client._id),
        },
      },
    ];
  }

  if (input.dateFrom || input.dateTo) {
    const paidAtFilter: Record<string, Date> = {};

    if (input.dateFrom) {
      if (!datePattern.test(input.dateFrom)) {
        throw new AppError("Ngày bắt đầu không hợp lệ", 400);
      }

      paidAtFilter.$gte = new Date(
        `${input.dateFrom}T00:00:00`
      );
    }

    if (input.dateTo) {
      if (!datePattern.test(input.dateTo)) {
        throw new AppError("Ngày kết thúc không hợp lệ", 400);
      }

      paidAtFilter.$lte = new Date(
        `${input.dateTo}T23:59:59.999`
      );
    }

    if (
      input.dateFrom &&
      input.dateTo &&
      input.dateFrom > input.dateTo
    ) {
      throw new AppError(
        "Ngày bắt đầu không được lớn hơn ngày kết thúc",
        400
      );
    }

    filter.paidAt = paidAtFilter;
  }

  const [items, totalItems, summary] = await Promise.all([
    populatePayment(
      Payment.find(filter)
        .sort({ paidAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ).lean(),

    Payment.countDocuments(filter),

    Payment.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "PAID"] },
                "$amount",
                0,
              ],
            },
          },
          paidCount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "PAID"] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(
        1,
        Math.ceil(totalItems / limit)
      ),
    },
    summary: {
      totalAmount: summary[0]?.totalAmount ?? 0,
      paidCount: summary[0]?.paidCount ?? 0,
    },
  };
};

export const getAdminPaymentById = async (
  paymentId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new AppError("Mã giao dịch không hợp lệ", 400);
  }

  const payment = await populatePayment(
    Payment.findById(paymentId)
  ).lean();

  if (!payment) {
    throw new AppError("Không tìm thấy giao dịch", 404);
  }

  return payment;
};

export const deleteAdminPayment = async (
  paymentId: string,
  actorId: string,
  actorRole: "ADMIN" | "RECEPTIONIST"
) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new AppError("Mã giao dịch không hợp lệ", 400);
  }

  const payment = await Payment.findByIdAndDelete(paymentId).lean();
  if (!payment) throw new AppError("Không tìm thấy giao dịch", 404);

  await Appointment.updateOne(
    { _id: payment.appointment },
    { $set: { paymentStatus: "UNPAID" } }
  );
  await recordAppointmentActivity({
    appointmentId: payment.appointment,
    action: "PAYMENT_DELETED",
    description: "Đã xóa giao dịch và chuyển lịch về chưa thanh toán",
    actorId,
    actorRole,
    metadata: {
      transactionCode: payment.transactionCode,
      amount: payment.amount,
      previousPaymentStatus: "PAID",
      newPaymentStatus: "UNPAID",
    },
  });

  return { id: paymentId, transactionCode: payment.transactionCode };
};
