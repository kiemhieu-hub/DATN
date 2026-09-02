import { Router } from "express";
import { getMySchedule, createLeave } from "../controllers/barberSchedule.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// Barber xem lịch của mình
router.get(
  "/",
  authenticate,
  authorize("BARBER"),
  getMySchedule
);

// Barber và Lễ tân đăng ký lịch nghỉ
router.post(
  "/leaves",
  authenticate,
  authorize("BARBER", "RECEPTIONIST", "ADMIN"),
  createLeave
);

export default router;