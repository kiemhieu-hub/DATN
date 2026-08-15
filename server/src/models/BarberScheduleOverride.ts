import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IBarberScheduleOverride extends Document {
  barber: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const schema = new Schema<IBarberScheduleOverride>({
  barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: timePattern },
  endTime: { type: String, required: true, match: timePattern },
  isWorking: { type: Boolean, default: true },
  note: { type: String, trim: true, maxlength: 300, default: "" },
}, { timestamps: true, versionKey: false });

schema.index({ barber: 1, date: 1 }, { unique: true });

const BarberScheduleOverride: Model<IBarberScheduleOverride> =
  mongoose.models.BarberScheduleOverride ||
  mongoose.model<IBarberScheduleOverride>("BarberScheduleOverride", schema);

export default BarberScheduleOverride;
