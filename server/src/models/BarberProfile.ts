import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface IBarberProfile extends Document {
  user: Types.ObjectId;

  bio: string;
  avatar: string;

  experienceYears: number;

  specialties: Types.ObjectId[];
  staffType: "HAIR" | "CARE";

  averageRating: number;
  reviewCount: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const barberProfileSchema =
  new Schema<IBarberProfile>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Tài khoản Barber là bắt buộc",
        ],
        unique: true,
      },

      bio: {
        type: String,
        trim: true,
        default: "",
        maxlength: [
          1500,
          "Giới thiệu không được quá 1500 ký tự",
        ],
      },

      avatar: {
        type: String,
        trim: true,
        default: "",
      },

      experienceYears: {
        type: Number,
        min: [0, "Số năm kinh nghiệm không hợp lệ"],
        default: 0,
      },

      specialties: [
        {
          type: Schema.Types.ObjectId,
          ref: "Service",
        },
      ],

      staffType: {
        type: String,
        enum: ["HAIR", "CARE"],
        default: "HAIR",
        index: true,
      },

      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      reviewCount: {
        type: Number,
        min: 0,
        default: 0,
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

barberProfileSchema.index({
  isActive: 1,
  averageRating: -1,
});

const BarberProfile: Model<IBarberProfile> =
  mongoose.models.BarberProfile ||
  mongoose.model<IBarberProfile>(
    "BarberProfile",
    barberProfileSchema
  );

export default BarberProfile;
