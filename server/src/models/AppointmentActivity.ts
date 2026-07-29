import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type AppointmentActivityActorRole =
  | "ADMIN"
  | "RECEPTIONIST"
  | "CLIENT"
  | "BARBER"
  | "SYSTEM";

export interface IAppointmentActivity extends Document {
  appointment: Types.ObjectId;
  action: string;
  description: string;
  actor?: Types.ObjectId;
  actorRole: AppointmentActivityActorRole;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentActivitySchema =
  new Schema<IAppointmentActivity>(
    {
      appointment: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        index: true,
      },
      action: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      actor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      actorRole: {
        type: String,
        enum: [
          "ADMIN",
          "RECEPTIONIST",
          "CLIENT",
          "BARBER",
          "SYSTEM",
        ],
        required: true,
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

appointmentActivitySchema.index({
  appointment: 1,
  createdAt: -1,
});

const AppointmentActivity: Model<IAppointmentActivity> =
  (mongoose.models.AppointmentActivity as
    | Model<IAppointmentActivity>
    | undefined) ??
  mongoose.model<IAppointmentActivity>(
    "AppointmentActivity",
    appointmentActivitySchema
  );

export default AppointmentActivity;
