import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IHairstyleGallery extends Document {
  title: string;
  image: string;
  category: string;
  description: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hairstyleGallerySchema = new Schema<IHairstyleGallery>({
  title: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  category: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  sortOrder: { type: Number, default: 0, min: 0, index: true },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

const HairstyleGallery: Model<IHairstyleGallery> =
  (mongoose.models.HairstyleGallery as Model<IHairstyleGallery> | undefined)
  ?? mongoose.model<IHairstyleGallery>("HairstyleGallery", hairstyleGallerySchema);

export default HairstyleGallery;
