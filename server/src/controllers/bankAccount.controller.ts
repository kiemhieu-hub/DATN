import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import { listBanks } from "../services/bankAccount.service";

export const getBanks = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, banks: await listBanks() }); } catch (error) { next(error); }
};
