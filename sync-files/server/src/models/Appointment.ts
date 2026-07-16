import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED";

export type CancellationRole =
  | "CLIENT"
  | "BARBER"
  | "ADMIN";

export interface IAppointmentService {
  service: Types.ObjectId;

  nameSnapshot: string;
  priceSnapshot: number;
  durationSnapshot: number;
}

export interface IAppointmentCancellation {
  cancelledBy?: Types.ObjectId;
  cancelledByRole?: CancellationRole;

  reason: string;
  cancelledAt?: Date;
}

export interface IAppointment extends Document {
  client: Types.ObjectId;
  barber: Types.ObjectId;

  services: IAppointmentService[];

  totalPrice: number;
  durationMinutes: number;

  appointmentDate: string;

  startTime: string;
  endTime: string;

  status: AppointmentStatus;
  paymentStatus: PaymentStatus;

  note: string;

  cancellation?: IAppointmentCancellation;

  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const timePattern =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const appointmentServiceSchema =
  new Schema<IAppointmentService>(
    {
      service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: [
          true,
          "Dịch vụ là bắt buộc",
        ],
      },

      nameSnapshot: {
        type: String,
        required: [
          true,
          "Tên dịch vụ tại thời điểm đặt là bắt buộc",
        ],
        trim: true,
      },

      priceSnapshot: {
        type: Number,
        required: [
          true,
          "Giá dịch vụ tại thời điểm đặt là bắt buộc",
        ],
        min: 0,
      },

      durationSnapshot: {
        type: Number,
        required: [
          true,
          "Thời lượng dịch vụ tại thời điểm đặt là bắt buộc",
        ],
        min: 1,
      },
    },
    {
      _id: false,
    }
  );

const cancellationSchema =
  new Schema<IAppointmentCancellation>(
    {
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      cancelledByRole: {
        type: String,
        enum: [
          "CLIENT",
          "BARBER",
          "ADMIN",
        ],
        default: null,
      },

      reason: {
        type: String,
        trim: true,
        default: "",
        maxlength: [
          500,
          "Lý do hủy không được quá 500 ký tự",
        ],
      },

      cancelledAt: {
        type: Date,
        default: null,
      },
    },
    {
      _id: false,
    }
  );

const appointmentSchema =
  new Schema<IAppointment>(
    {
      client: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Khách hàng là bắt buộc",
        ],
      },

      barber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Barber là bắt buộc",
        ],
      },

      services: {
        type: [appointmentServiceSchema],
        required: [
          true,
          "Danh sách dịch vụ là bắt buộc",
        ],
        validate: {
          validator: (
            services: IAppointmentService[]
          ) =>
            Array.isArray(services) &&
            services.length > 0,

          message:
            "Phải chọn ít nhất một dịch vụ",
        },
      },

      totalPrice: {
        type: Number,
        required: [
          true,
          "Tổng tiền là bắt buộc",
        ],
        min: 0,
      },

      durationMinutes: {
        type: Number,
        required: [
          true,
          "Tổng thời gian là bắt buộc",
        ],
        min: 1,
      },

      appointmentDate: {
        type: String,
        required: [
          true,
          "Ngày đặt lịch là bắt buộc",
        ],
        match: [
          /^\d{4}-\d{2}-\d{2}$/,
          "Ngày phải có định dạng YYYY-MM-DD",
        ],
      },

      startTime: {
        type: String,
        required: [
          true,
          "Giờ bắt đầu là bắt buộc",
        ],
        match: [
          timePattern,
          "Giờ bắt đầu không hợp lệ",
        ],
      },

      endTime: {
        type: String,
        required: [
          true,
          "Giờ kết thúc là bắt buộc",
        ],
        match: [
          timePattern,
          "Giờ kết thúc không hợp lệ",
        ],
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "CONFIRMED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ],
        default: "PENDING",
      },

      paymentStatus: {
        type: String,
        enum: [
          "UNPAID",
          "PENDING",
          "PAID",
          "REFUNDED",
        ],
        default: "UNPAID",
      },

      note: {
        type: String,
        trim: true,
        default: "",
        maxlength: [
          500,
          "Ghi chú không được quá 500 ký tự",
        ],
      },

      cancellation: {
        type: cancellationSchema,
        default: undefined,
      },

      confirmedAt: {
        type: Date,
        default: null,
      },

      startedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

appointmentSchema.index({
  client: 1,
  appointmentDate: -1,
});

appointmentSchema.index({
  barber: 1,
  appointmentDate: 1,
  startTime: 1,
});

appointmentSchema.index({
  status: 1,
  appointmentDate: 1,
});

appointmentSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>(
    "Appointment",
    appointmentSchema
  );

export default Appointment;