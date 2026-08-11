import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFavoriteHairstyle extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  title: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteHairstyleSchema = new Schema<IFavoriteHairstyle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "", trim: true },
  },
  { timestamps: true, versionKey: false }
);

favoriteHairstyleSchema.index({ userId: 1, imageUrl: 1 }, { unique: true });

const FavoriteHairstyle: Model<IFavoriteHairstyle> =
  (mongoose.models.FavoriteHairstyle as Model<IFavoriteHairstyle> | undefined) ??
  mongoose.model<IFavoriteHairstyle>("FavoriteHairstyle", favoriteHairstyleSchema);

export default FavoriteHairstyle;
