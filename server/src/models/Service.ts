import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type ServiceGroup =
  | "HAIRCUT"
  | "BEARD"
  | "COLOR"
  | "CARE"
  | "OTHER";

export type ServiceStaffType = "HAIR" | "CARE";

export interface IService extends Document {
  name: string;
  description: string;

  price: number;
  priceFrom: boolean;

  durationMinutes: number;

  group: ServiceGroup;
  isExclusiveInGroup: boolean;
  staffType: ServiceStaffType;

  image: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [
        true,
        "Tên dịch vụ là bắt buộc",
      ],
      trim: true,
      unique: true,
      maxlength: [
        150,
        "Tên dịch vụ không được quá 150 ký tự",
      ],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        1000,
        "Mô tả không được quá 1000 ký tự",
      ],
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

    priceFrom: {
      type: Boolean,
      default: false,
    },

    durationMinutes: {
      type: Number,
      required: [
        true,
        "Thời lượng dịch vụ là bắt buộc",
      ],
      min: [
        1,
        "Thời lượng dịch vụ phải lớn hơn 0",
      ],
    },

    group: {
      type: String,
      enum: [
        "HAIRCUT",
        "BEARD",
        "COLOR",
        "CARE",
        "OTHER",
      ],
      required: [
        true,
        "Nhóm dịch vụ là bắt buộc",
      ],
    },

    isExclusiveInGroup: {
      type: Boolean,
      default: false,
    },

    staffType: {
      type: String,
      enum: ["HAIR", "CARE"],
      default: "HAIR",
      index: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

serviceSchema.index({
  group: 1,
  isActive: 1,
});

const Service: Model<IService> =
  (mongoose.models.Service as
    | Model<IService>
    | undefined) ??
  mongoose.model<IService>(
    "Service",
    serviceSchema
  );

export default Service;
