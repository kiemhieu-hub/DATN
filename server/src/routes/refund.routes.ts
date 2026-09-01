import { Router } from "express";

import { getRefunds, updateRefund } from "../controllers/refund.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN", "RECEPTIONIST"));
router.get("/", getRefunds);
router.patch("/:id", updateRefund);

export default router;

