import { Router } from "express";

import {
  createPaymentUrl,
  getPaymentStatus,
  vnpayIpn,
  vnpayReturn,
} from "../controllers/vnpay.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// VNPay gọi hai endpoint này nên không được yêu cầu JWT.
router.get("/return", vnpayReturn);
router.get("/ipn", vnpayIpn);

router.post("/create", authenticate, authorize("CLIENT"), createPaymentUrl);
router.get(
  "/status/:transactionCode",
  authenticate,
  authorize("CLIENT"),
  getPaymentStatus
);

export default router;
