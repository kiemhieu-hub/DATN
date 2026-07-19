import mongoose, { Schema, type Document } from "mongoose";

export interface IFavoriteHairstyle extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  title: string;
  createdAt: Date;
}

const favoriteHairstyleSchema = new Schema<IFavoriteHairstyle>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Đảm bảo không trùng lặp cho cùng user + image
favoriteHairstyleSchema.index(
  { userId: 1, imageUrl: 1 },
  { unique: true }
);

const FavoriteHairstyle = mongoose.model<IFavoriteHairstyle>(
  "FavoriteHairstyle",
  favoriteHairstyleSchema
);

export default FavoriteHairstyle;
