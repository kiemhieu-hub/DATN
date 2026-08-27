import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getBanks, verifyBankAccount } from "../controllers/bankAccount.controller";

const router = Router();
router.use(authenticate);
router.get("/", getBanks);
router.post("/lookup", verifyBankAccount);
export default router;
