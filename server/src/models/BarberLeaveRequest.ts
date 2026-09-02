import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IBarberLeaveRequest extends Document {
  barber: Types.ObjectId;
  startDate: string;
  endDate: string;
  reasonType: "SICK" | "PERSONAL" | "VACATION" | "OTHER";
  note: string;
  status: LeaveRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewNote: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IBarberLeaveRequest>({
  barber: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  reasonType: { type: String, enum: ["SICK", "PERSONAL", "VACATION", "OTHER"], required: true },
  note: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
  reviewedAt: Date,
}, { timestamps: true, versionKey: false });

schema.index({ status: 1, createdAt: -1 });

const BarberLeaveRequest: Model<IBarberLeaveRequest> =
  mongoose.models.BarberLeaveRequest ||
  mongoose.model<IBarberLeaveRequest>("BarberLeaveRequest", schema);

export default BarberLeaveRequest;
