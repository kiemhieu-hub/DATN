import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type AppointmentStatus =| "PENDING"| "CONFIRMED"| "IN_PROGRESS"| "COMPLETED"| "CANCELLED";

export interface IAppointmentService {
  name: string;
  price: number;
}

export interface IAppointment extends Document {
  client: Types.ObjectId;

  services: IAppointmentService[];
  totalPrice: number;

  barberName: string;
  appointmentDate: string;

  /**
   * Giờ bắt đầu, ví dụ: 09:00
   */
  timeSlot: string;

  /**
   * Tổng thời gian của tất cả dịch vụ.
   * Ví dụ: cắt tóc 45 phút + nhuộm 90 phút = 135 phút.
   */
  durationMinutes: number;

  /**
   * Giờ kết thúc được backend tự tính.
   * Ví dụ: bắt đầu 09:00, kéo dài 90 phút => 10:30.
   */
  endTime: string;

  note?: string;
  status: AppointmentStatus;
  cancelReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const appointmentServiceSchema =
  new Schema<IAppointmentService>(
    {
      name: {
        type: String,
        required: [
          true,
          "Tên dịch vụ là bắt buộc",
        ],
        trim: true,
      },

      price: {
        type: Number,
        required: [
          true,
          "Giá dịch vụ là bắt buộc",
        ],
        min: [
          0,
          "Giá dịch vụ không hợp lệ",
        ],
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
        required: true,
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
          ) => {
            return (
              Array.isArray(services) &&
              services.length > 0
            );
          },
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

      barberName: {
        type: String,
        required: [
          true,
          "Barber là bắt buộc",
        ],
        trim: true,
      },

      appointmentDate: {
        type: String,
        required: [
          true,
          "Ngày đặt lịch là bắt buộc",
        ],
        match: [
          /^\d{4}-\d{2}-\d{2}$/,
          "Ngày đặt lịch phải có định dạng YYYY-MM-DD",
        ],
      },

      timeSlot: {
        type: String,
        required: [
          true,
          "Khung giờ là bắt buộc",
        ],
        match: [
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Khung giờ phải có định dạng HH:mm",
        ],
      },

      durationMinutes: {
        type: Number,
        required: [
          true,
          "Thời lượng lịch hẹn là bắt buộc",
        ],
        min: [
          1,
          "Thời lượng lịch hẹn không hợp lệ",
        ],
      },

      endTime: {
        type: String,
        required: [
          true,
          "Giờ kết thúc là bắt buộc",
        ],
        match: [
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Giờ kết thúc phải có định dạng HH:mm",
        ],
      },

      note: {
        type: String,
        trim: true,
        maxlength: [
          500,
          "Ghi chú không được quá 500 ký tự",
        ],
        default: "",
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

      cancelReason: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Không sử dụng unique index theo:
 * barberName + appointmentDate + timeSlot
 *
 * Vì một lịch có thể kéo dài nhiều giờ.
 * Backend sẽ tự kiểm tra khoảng thời gian bị trùng.
 */

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>(
    "Appointment",
    appointmentSchema
  );

export default Appointment;