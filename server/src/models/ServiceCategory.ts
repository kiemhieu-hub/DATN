import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IServiceCategory extends Document {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategory>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  description: { type: String, default: "", trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

const ServiceCategory: Model<IServiceCategory> =
  (mongoose.models.ServiceCategory as Model<IServiceCategory> | undefined)
  ?? mongoose.model<IServiceCategory>("ServiceCategory", serviceCategorySchema);

export default ServiceCategory;
