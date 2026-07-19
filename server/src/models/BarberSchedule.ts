import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IScheduleBreak {
  startTime: string;
  endTime: string;
}

export interface IBarberSchedule extends Document {
  barber: Types.ObjectId;

  /**
   * 0: Chủ Nhật
   * 1: Thứ Hai
   * ...
   * 6: Thứ Bảy
   */
  dayOfWeek: number;

  startTime: string;
  endTime: string;

  breaks: IScheduleBreak[];

  isWorking: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const timePattern =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleBreakSchema =
  new Schema<IScheduleBreak>(
    {
      startTime: {
        type: String,
        required: true,
        match: [
          timePattern,
          "Giờ bắt đầu nghỉ không hợp lệ",
        ],
      },

      endTime: {
        type: String,
        required: true,
        match: [
          timePattern,
          "Giờ kết thúc nghỉ không hợp lệ",
        ],
      },
    },
    {
      _id: false,
    }
  );

const barberScheduleSchema =
  new Schema<IBarberSchedule>(
    {
      barber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Barber là bắt buộc"],
      },

      dayOfWeek: {
        type: Number,
        required: [
          true,
          "Ngày trong tuần là bắt buộc",
        ],
        min: 0,
        max: 6,
      },

      startTime: {
        type: String,
        required: [
          true,
          "Giờ bắt đầu làm việc là bắt buộc",
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
          "Giờ kết thúc làm việc là bắt buộc",
        ],
        match: [
          timePattern,
          "Giờ kết thúc không hợp lệ",
        ],
      },

      breaks: {
        type: [scheduleBreakSchema],
        default: [],
      },

      isWorking: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

barberScheduleSchema.index(
  {
    barber: 1,
    dayOfWeek: 1,
  },
  {
    unique: true,
  }
);

const BarberSchedule: Model<IBarberSchedule> =
  mongoose.models.BarberSchedule ||
  mongoose.model<IBarberSchedule>(
    "BarberSchedule",
    barberScheduleSchema
  );

export default BarberSchedule;