import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import * as chatService from "../services/chat.service";

const requireUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("Bạn chưa đăng nhập");
  return req.user;
};

export const conversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try { requireUser(req); res.json({ success: true, items: await chatService.getConversations() }); } catch (error) { next(error); }
};
export const messages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    res.json({ success: true, items: await chatService.getMessages(user.userId, user.role, typeof req.query.userId === "string" ? req.query.userId : undefined) });
  } catch (error) { next(error); }
};
export const send = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    const message = await chatService.sendMessage({ currentUserId: user.userId, role: user.role, recipientId: req.body.recipientId, text: req.body.text, imageData: req.body.imageData, requestType: req.body.requestType });
    res.status(201).json({ success: true, message });
  } catch (error) { next(error); }
};
