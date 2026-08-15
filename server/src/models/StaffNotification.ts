import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type StaffNotificationKind =
  | "NEW_APPOINTMENT"
  | "UPCOMING"
  | "NO_SHOW"
  | "WAITING_PAYMENT"
  | "APPOINTMENT_CHANGED"
  | "PAYMENT";

export interface IStaffNotification
  extends Document {
  title: string;
  message: string;
  kind: StaffNotificationKind;
  appointment?: Types.ObjectId;
  audienceRoles: Array<
    "ADMIN" | "RECEPTIONIST"
  >;
  readBy: Types.ObjectId[];
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffNotificationSchema =
  new Schema<IStaffNotification>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160,
      },
      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      kind: {
        type: String,
        required: true,
        enum: [
          "NEW_APPOINTMENT",
          "UPCOMING",
          "NO_SHOW",
          "WAITING_PAYMENT",
          "APPOINTMENT_CHANGED",
          "PAYMENT",
        ],
        index: true,
      },
      appointment: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
        index: true,
      },
      audienceRoles: {
        type: [String],
        enum: ["ADMIN", "RECEPTIONIST"],
        default: [
          "ADMIN",
          "RECEPTIONIST",
        ],
        index: true,
      },
      readBy: {
        type: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        default: [],
      },
      dedupeKey: {
        type: String,
        trim: true,
        sparse: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

staffNotificationSchema.index({
  audienceRoles: 1,
  createdAt: -1,
});

const StaffNotification: Model<IStaffNotification> =
  (mongoose.models.StaffNotification as
    | Model<IStaffNotification>
    | undefined) ??
  mongoose.model<IStaffNotification>(
    "StaffNotification",
    staffNotificationSchema
  );

export default StaffNotification;
