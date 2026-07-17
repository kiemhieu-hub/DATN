import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type PaymentMethod =
  | "CASH"
  | "VNPAY"
  | "MOMO"
  | "BANK_TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface IPayment extends Document {
  appointment: Types.ObjectId;
  client: Types.ObjectId;

  amount: number;

  method: PaymentMethod;
  status: PaymentStatus;

  transactionCode: string;
  providerTransactionId: string;

  paymentUrl: string;

  paidAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;

  failureReason: string;
  refundReason: string;

  metadata: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [
        true,
        "Lịch hẹn là bắt buộc",
      ],
      index: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "Khách hàng là bắt buộc",
      ],
      index: true,
    },

    amount: {
      type: Number,
      required: [
        true,
        "Số tiền thanh toán là bắt buộc",
      ],
      min: [
        0,
        "Số tiền thanh toán không hợp lệ",
      ],
    },

    method: {
      type: String,
      enum: [
        "CASH",
        "VNPAY",
        "MOMO",
        "BANK_TRANSFER",
      ],
      required: [
        true,
        "Phương thức thanh toán là bắt buộc",
      ],
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    transactionCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: "",
    },

    providerTransactionId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentUrl: {
      type: String,
      trim: true,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        500,
        "Lý do thất bại không được quá 500 ký tự",
      ],
    },

    refundReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        500,
        "Lý do hoàn tiền không được quá 500 ký tự",
      ],
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({
  appointment: 1,
  createdAt: -1,
});

paymentSchema.index({
  client: 1,
  createdAt: -1,
});

paymentSchema.index({
  status: 1,
  method: 1,
  createdAt: -1,
});

const Payment: Model<IPayment> =
  (mongoose.models.Payment as
    | Model<IPayment>
    | undefined) ??
  mongoose.model<IPayment>(
    "Payment",
    paymentSchema
  );

export default Payment;