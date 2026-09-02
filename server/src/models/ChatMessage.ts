import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ChatRequestType = "GENERAL" | "RESCHEDULE" | "CANCEL_REFUND" | "CHANGE_SCHEDULE" | "LEAVE_REQUEST";

export interface IChatMessage extends Document {
  owner: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: "CLIENT" | "BARBER" | "RECEPTIONIST";
  text: string;
  imageData: string;
  requestType: ChatRequestType;
  readByOwner: boolean;
  readByReceptionist: boolean;
  createdAt: Date;
}

const schema = new Schema<IChatMessage>({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["CLIENT", "BARBER", "RECEPTIONIST"], required: true },
  text: { type: String, trim: true, maxlength: 2000, default: "" },
  imageData: { type: String, default: "" },
  requestType: { type: String, enum: ["GENERAL", "RESCHEDULE", "CANCEL_REFUND", "CHANGE_SCHEDULE", "LEAVE_REQUEST"], default: "GENERAL" },
  readByOwner: { type: Boolean, default: false },
  readByReceptionist: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

schema.index({ owner: 1, createdAt: 1 });

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", schema);
export default ChatMessage;
