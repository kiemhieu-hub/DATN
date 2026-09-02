import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getBanks } from "../controllers/bankAccount.controller";

const router = Router();
router.use(authenticate);
router.get("/", getBanks);
export default router;
