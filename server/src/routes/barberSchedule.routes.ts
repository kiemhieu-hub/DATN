import { Router } from "express";

import {
  getMySchedule,
  updateScheduleDay,
  updateWeeklySchedule,
} from "../controllers/barberSchedule.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("BARBER"),
  getMySchedule
);


router.patch(
  "/",
  authenticate,
  authorize("BARBER"),
  updateWeeklySchedule
);

router.patch(
  "/day",
  authenticate,
  authorize("BARBER"),
  updateScheduleDay
);

export default router;