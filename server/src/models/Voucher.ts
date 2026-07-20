import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  name: string;
  description: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount: number;
  minOrder: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  type: { type: String, enum: ["PERCENT", "FIXED"], default: "PERCENT" },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0, min: 0 },
  minOrder: { type: Number, default: 0, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 0, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

const Voucher: Model<IVoucher> =
  (mongoose.models.Voucher as Model<IVoucher> | undefined)
  ?? mongoose.model<IVoucher>("Voucher", voucherSchema);

export default Voucher;
