import { Router } from "express";

import { validateVoucher } from "../controllers/voucher.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/validate", authenticate, authorize("CLIENT"), validateVoucher);

export default router;
