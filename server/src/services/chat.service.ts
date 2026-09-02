import mongoose from "mongoose";
import ChatMessage, { type ChatRequestType } from "../models/ChatMessage";
import User from "../models/User";
import AppError from "../utils/AppError";

const allowedRequests: Record<string, ChatRequestType[]> = {
  CLIENT: ["GENERAL", "RESCHEDULE", "CANCEL_REFUND"],
  BARBER: ["GENERAL", "CHANGE_SCHEDULE", "LEAVE_REQUEST"],
  RECEPTIONIST: ["GENERAL"],
};

export const getConversations = async () => {
  const rows = await ChatMessage.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$owner", lastMessage: { $first: "$text" }, lastImage: { $first: "$imageData" }, lastAt: { $first: "$createdAt" }, unread: { $sum: { $cond: [{ $eq: ["$readByReceptionist", false] }, 1, 0] } } } },
    { $sort: { lastAt: -1 } },
  ]);
  const users = await User.find({ _id: { $in: rows.map((row) => row._id) } }).select("fullName email phone role avatar").lean();
  const userById = new Map(users.map((user) => [String(user._id), user]));
  return rows.map((row) => ({ ...row, user: userById.get(String(row._id)) })).filter((row) => row.user);
};

export const getMessages = async (currentUserId: string, role: string, requestedUserId?: string) => {
  const ownerId = role === "RECEPTIONIST" ? requestedUserId : currentUserId;
  if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) throw new AppError("Chưa chọn cuộc trò chuyện", 400);
  if (role === "RECEPTIONIST") {
    await ChatMessage.updateMany({ owner: ownerId, senderRole: { $ne: "RECEPTIONIST" }, readByReceptionist: false }, { $set: { readByReceptionist: true } });
  } else {
    await ChatMessage.updateMany({ owner: ownerId, senderRole: "RECEPTIONIST", readByOwner: false }, { $set: { readByOwner: true } });
  }
  return ChatMessage.find({ owner: ownerId }).populate("sender", "fullName role avatar").sort({ createdAt: 1 }).limit(300).lean();
};

export const sendMessage = async (input: { currentUserId: string; role: string; recipientId?: string; text?: string; imageData?: string; requestType?: ChatRequestType }) => {
  const ownerId = input.role === "RECEPTIONIST" ? input.recipientId : input.currentUserId;
  if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) throw new AppError("Chưa chọn người nhận", 400);
  if (input.role === "RECEPTIONIST") {
    const recipient = await User.findOne({ _id: ownerId, role: { $in: ["CLIENT", "BARBER"] }, status: "ACTIVE" });
    if (!recipient) throw new AppError("Người nhận không hợp lệ", 400);
  }
  const text = input.text?.trim() || "";
  const imageData = input.imageData || "";
  if (!text && !imageData) throw new AppError("Vui lòng nhập tin nhắn hoặc chọn ảnh", 400);
  if (imageData && (!/^data:image\/(png|jpe?g|webp);base64,/.test(imageData) || imageData.length > 14_000_000)) {
    throw new AppError("Ảnh không hợp lệ hoặc vượt quá 10 MB", 400);
  }
  const senderRole = (["CLIENT", "BARBER", "RECEPTIONIST"] as const).find((value) => value === input.role);
  if (!senderRole) throw new AppError("Vai trò chat không hợp lệ", 403);
  const requestType = allowedRequests[input.role]?.includes(input.requestType || "GENERAL") ? input.requestType || "GENERAL" : "GENERAL";
  return ChatMessage.create({
    owner: ownerId,
    sender: input.currentUserId,
    senderRole,
    text,
    imageData,
    requestType,
    readByOwner: input.role !== "RECEPTIONIST",
    readByReceptionist: input.role === "RECEPTIONIST",
  });
};
