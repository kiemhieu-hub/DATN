import mongoose, { Schema, type Document } from "mongoose";

export type UserRole = "CLIENT" | "BARBER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["CLIENT", "BARBER", "ADMIN"],
      default: "CLIENT",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;