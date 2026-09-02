import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type ScheduleChangeType =
  | "WEEKLY_UPDATED"
  | "DATE_OVERRIDE_SAVED"
  | "DATE_OVERRIDE_REMOVED";

export interface IBarberScheduleChangeLog extends Document {
  barber: Types.ObjectId;
  actor: Types.ObjectId;
  changeType: ScheduleChangeType;
  effectiveDate?: string;
  before?: unknown;
  after?: unknown;
  note: string;
  createdAt: Date;
}

const schema = new Schema<IBarberScheduleChangeLog>(
  {
    barber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeType: {
      type: String,
      enum: [
        "WEEKLY_UPDATED",
        "DATE_OVERRIDE_SAVED",
        "DATE_OVERRIDE_REMOVED",
      ],
      required: true,
    },
    effectiveDate: {
      type: String,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    before: {
      type: Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: Schema.Types.Mixed,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

schema.index({ barber: 1, createdAt: -1 });

const BarberScheduleChangeLog: Model<IBarberScheduleChangeLog> =
  mongoose.models.BarberScheduleChangeLog ||
  mongoose.model<IBarberScheduleChangeLog>(
    "BarberScheduleChangeLog",
    schema
  );

export default BarberScheduleChangeLog;
