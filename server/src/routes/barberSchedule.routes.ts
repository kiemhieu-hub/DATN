import { Router } from "express";

import { getMySchedule } from "../controllers/barberSchedule.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("BARBER"),
  getMySchedule
);


export default router;
