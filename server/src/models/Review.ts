import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "HIDDEN";

export interface IReview extends Document {
  appointment: Types.ObjectId;
  client: Types.ObjectId;
  barber: Types.ObjectId;

  serviceRatings: Array<{
    service: Types.ObjectId;
    rating: number;
    comment: string;
  }>;

  barberRating: number;
  barberComment: string;

  overallRating: number;

  status: ReviewStatus;

  moderationNote: string;

  approvedBy?: Types.ObjectId;
  approvedAt?: Date;

  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;

  hiddenBy?: Types.ObjectId;
  hiddenAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const serviceRatingSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [
        true,
        "Dịch vụ đánh giá là bắt buộc",
      ],
    },

    rating: {
      type: Number,
      required: [
        true,
        "Số sao dịch vụ là bắt buộc",
      ],
      min: [
        1,
        "Số sao tối thiểu là 1",
      ],
      max: [
        5,
        "Số sao tối đa là 5",
      ],
    },

    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        1000,
        "Nội dung đánh giá dịch vụ không được quá 1000 ký tự",
      ],
    },
  },
  {
    _id: false,
  }
);

const reviewSchema = new Schema<IReview>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [
        true,
        "Lịch hẹn là bắt buộc",
      ],
      unique: true,
      index: true,
    },

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

    serviceRatings: {
      type: [serviceRatingSchema],
      default: [],
    },

    barberRating: {
      type: Number,
      required: [
        true,
        "Số sao Barber là bắt buộc",
      ],
      min: [
        1,
        "Số sao tối thiểu là 1",
      ],
      max: [
        5,
        "Số sao tối đa là 5",
      ],
    },

    barberComment: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        1000,
        "Nội dung đánh giá Barber không được quá 1000 ký tự",
      ],
    },

    overallRating: {
      type: Number,
      required: [
        true,
        "Điểm đánh giá tổng thể là bắt buộc",
      ],
      min: [
        1,
        "Điểm đánh giá tối thiểu là 1",
      ],
      max: [
        5,
        "Điểm đánh giá tối đa là 5",
      ],
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "HIDDEN",
      ],
      default: "PENDING",
      index: true,
    },

    moderationNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        1000,
        "Ghi chú kiểm duyệt không được quá 1000 ký tự",
      ],
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    hiddenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    hiddenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({
  barber: 1,
  status: 1,
  createdAt: -1,
});

reviewSchema.index({
  client: 1,
  createdAt: -1,
});

reviewSchema.index({
  status: 1,
  createdAt: -1,
});

const Review: Model<IReview> =
  (mongoose.models.Review as
    | Model<IReview>
    | undefined) ??
  mongoose.model<IReview>(
    "Review",
    reviewSchema
  );

export default Review;