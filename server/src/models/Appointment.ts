import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type AppointmentStatus =| "PENDING"| "CONFIRMED"| "CHECKED_IN"| "IN_PROGRESS"| "COMPLETED"| "NO_SHOW"| "CANCELLED";

export type AppointmentPaymentStatus =| "UNPAID"| "PENDING"| "PAID"| "REFUNDED";

export type CancellationRole =| "CLIENT"| "RECEPTIONIST"| "ADMIN";

export interface IAppointmentCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface IStaffAssignment {
  barber: Types.ObjectId;
  staffType: "HAIR" | "CARE";
  serviceIds: Types.ObjectId[];
  startTime: string;
  endTime: string;
}

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
  depositRefundStatus?: "NOT_APPLICABLE" | "ELIGIBLE" | "NOT_ELIGIBLE" | "REFUNDED";
  depositRefundAmount?: number;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
}

export interface IAppointment extends Document {
  client: Types.ObjectId;
  barber: Types.ObjectId;
  appointmentCode: string;
  customer: IAppointmentCustomer;
  staffAssignments: IStaffAssignment[];

  services: IAppointmentService[];

  totalPrice: number;
  subtotal: number;
  voucherCode: string;
  discountPercent: number;
  discountAmount: number;
  depositRequired: boolean;
  depositAmount: number;
  depositPaid: boolean;
  durationMinutes: number;

  appointmentDate: string;
  startTime: string;
  endTime: string;

  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;

  note: string;

  cancellation?: IAppointmentCancellation;
  checkedInAt?: Date;
  noShowAt?: Date;
  reopenedAt?: Date;
  rescheduleConsent: boolean;

  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const timePattern =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const datePattern =
  /^\d{4}-\d{2}-\d{2}$/;

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
        maxlength: [
          150,
          "Tên dịch vụ không được quá 150 ký tự",
        ],
      },

      priceSnapshot: {
        type: Number,
        required: [
          true,
          "Giá dịch vụ tại thời điểm đặt là bắt buộc",
        ],
        min: [
          0,
          "Giá dịch vụ không hợp lệ",
        ],
      },

      durationSnapshot: {
        type: Number,
        required: [
          true,
          "Thời lượng dịch vụ tại thời điểm đặt là bắt buộc",
        ],
        min: [
          1,
          "Thời lượng dịch vụ phải lớn hơn 0",
        ],
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
          "RECEPTIONIST",
          "ADMIN",
        ],
        default: null,
      },

      reason: {
        type: String,
        trim: true,
        required: [
          true,
          "Lý do hủy là bắt buộc",
        ],
        maxlength: [
          500,
          "Lý do hủy không được quá 500 ký tự",
        ],
      },

      cancelledAt: {
        type: Date,
        default: null,
      },
      depositRefundStatus: {
        type: String,
        enum: ["NOT_APPLICABLE", "ELIGIBLE", "NOT_ELIGIBLE", "REFUNDED"],
        default: "NOT_APPLICABLE",
      },
      depositRefundAmount: { type: Number, min: 0, default: 0 },
      refundBankName: { type: String, trim: true, maxlength: 100, default: "" },
      refundAccountNumber: { type: String, trim: true, maxlength: 40, default: "" },
      refundAccountName: { type: String, trim: true, maxlength: 120, default: "" },
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
        index: true,
      },

      barber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Barber là bắt buộc",
        ],
        index: true,
      },

      appointmentCode: {
        type: String,
        default: () => `THADS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        unique: true,
        index: true,
      },

      customer: {
        fullName: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" },
      },

      staffAssignments: {
        type: [{
          barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
          staffType: { type: String, enum: ["HAIR", "CARE"], required: true },
          serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        }],
        default: [],
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
        min: [
          0,
          "Tổng tiền không hợp lệ",
        ],
      },

      subtotal: { type: Number, default: 0, min: 0 },
      voucherCode: { type: String, trim: true, uppercase: true, default: "" },
      discountPercent: { type: Number, min: 0, max: 100, default: 0 },
      discountAmount: { type: Number, min: 0, default: 0 },
      depositRequired: { type: Boolean, default: false },
      depositAmount: { type: Number, min: 0, default: 0 },
      depositPaid: { type: Boolean, default: false },

      durationMinutes: {
        type: Number,
        required: [
          true,
          "Tổng thời gian là bắt buộc",
        ],
        min: [
          1,
          "Tổng thời gian phải lớn hơn 0",
        ],
      },

      appointmentDate: {
        type: String,
        required: [
          true,
          "Ngày đặt lịch là bắt buộc",
        ],
        match: [
          datePattern,
          "Ngày đặt lịch phải có định dạng YYYY-MM-DD",
        ],
        index: true,
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
          "CHECKED_IN",
          "IN_PROGRESS",
          "COMPLETED",
          "NO_SHOW",
          "CANCELLED",
        ],
        default: "PENDING",
        index: true,
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
        index: true,
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

      checkedInAt: { type: Date, default: null },
      noShowAt: { type: Date, default: null },
      reopenedAt: { type: Date, default: null },
      rescheduleConsent: { type: Boolean, default: false },

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
  startTime: -1,
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

appointmentSchema.index({
  barber: 1,
  appointmentDate: 1,
  status: 1,
});

const Appointment: Model<IAppointment> =
  (mongoose.models.Appointment as
    | Model<IAppointment>
    | undefined) ??
  mongoose.model<IAppointment>(
    "Appointment",
    appointmentSchema
  );

export default Appointment;
