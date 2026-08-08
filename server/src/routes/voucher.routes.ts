import { Router } from "express";

import {
  getAvailableVouchers,
  validateVoucher,
} from "../controllers/voucher.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/validate", authenticate, authorize("CLIENT"), validateVoucher);
router.post("/available", authenticate, authorize("CLIENT"), getAvailableVouchers);

export default router;
