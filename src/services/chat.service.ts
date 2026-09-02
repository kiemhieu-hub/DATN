import api from "./api";

export type ChatRequestType = "GENERAL" | "RESCHEDULE" | "CANCEL_REFUND" | "CHANGE_SCHEDULE" | "LEAVE_REQUEST";
export interface ChatMessage { _id:string; owner:string; sender:{_id:string;fullName:string;role:string}; senderRole:string;text:string;imageData:string;requestType:ChatRequestType;createdAt:string }
export interface ChatConversation { _id:string;lastMessage:string;lastImage:string;lastAt:string;unread:number;user:{_id:string;fullName:string;email:string;phone:string;role:"CLIENT"|"BARBER"} }

export const getChatConversations = async () => (await api.get<{success:boolean;items:ChatConversation[]}>("/chat/conversations")).data;
export const getChatMessages = async (userId?:string) => (await api.get<{success:boolean;items:ChatMessage[]}>("/chat/messages",{params:userId?{userId}:{}})).data;
export const sendChatMessage = async (data:{recipientId?:string;text?:string;imageData?:string;requestType:ChatRequestType}) => (await api.post("/chat/messages",data)).data;
