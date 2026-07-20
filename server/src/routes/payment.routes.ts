import { Router } from "express";

import {
  getByAppointment,
  payCash,
  getPayments,
  getPaymentDetail,
  payBankTransfer,
  deletePayment,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(
  authenticate,
  authorize("ADMIN", "RECEPTIONIST")
);

router.get(
  "/",
  getPayments
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  deletePayment
);

router.post(
  "/appointments/:appointmentId/cash",
  payCash
);

router.post(
  "/appointments/:appointmentId/bank-transfer",
  payBankTransfer
);

router.get(
  "/appointments/:appointmentId",
  getByAppointment
);

router.get(
  "/:id",
  getPaymentDetail
);

export default router;
