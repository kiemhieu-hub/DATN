import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate";
import { listBanks, lookupBankAccount } from "../services/bankAccount.service";

export const getBanks = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try { res.json({ success: true, banks: await listBanks() }); } catch (error) { next(error); }
};

export const verifyBankAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await lookupBankAccount(String(req.body.bankCode || "").trim().toUpperCase(), String(req.body.accountNumber || "").trim());
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};
