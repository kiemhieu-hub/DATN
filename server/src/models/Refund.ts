import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type RefundStatus =
  | "PENDING"
  | "PROCESSING"
  | "REFUNDED"
  | "REFUNDED_MANUAL"
  | "FAILED"
  | "REJECTED";

export interface IRefund extends Document {
  appointment: Types.ObjectId;
  payment?: Types.ObjectId;
  amount: number;
  reason: string;
  method: "VNPAY" | "BANK_TRANSFER" | "CASH";
  status: RefundStatus;
  providerTransactionId: string;
  bankReference: string;
  proofImage: string;
  requestedBy: Types.ObjectId;
  requestedAt: Date;
  processedBy?: Types.ObjectId;
  completedAt?: Date;
  failureReason: string;
  providerResponse: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    method: { type: String, enum: ["VNPAY", "BANK_TRANSFER", "CASH"], required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "REFUNDED", "REFUNDED_MANUAL", "FAILED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    providerTransactionId: { type: String, trim: true, default: "" },
    bankReference: { type: String, trim: true, default: "" },
    proofImage: { type: String, trim: true, default: "" },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedAt: { type: Date, default: Date.now },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, trim: true, default: "" },
    providerResponse: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

refundSchema.index({ appointment: 1, status: 1, createdAt: -1 });

const Refund: Model<IRefund> =
  (mongoose.models.Refund as Model<IRefund> | undefined) ??
  mongoose.model<IRefund>("Refund", refundSchema);

export default Refund;
