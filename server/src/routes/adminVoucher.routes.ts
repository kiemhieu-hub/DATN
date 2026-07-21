import { Router } from "express";

import {
  changeVoucherStatus,
  createVoucher,
  getVouchers,
  removeVoucher,
  updateVoucher,
} from "../controllers/adminVoucher.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/", getVouchers);
router.post("/", createVoucher);
router.put("/:id", updateVoucher);
router.patch("/:id/status", changeVoucherStatus);
router.delete("/:id", removeVoucher);

export default router;
