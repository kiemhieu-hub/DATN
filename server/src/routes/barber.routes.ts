import { Router } from "express";

import {
  getBarberMine,
  updateBarberStatus,
} from "../controllers/appointment.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/appointments",
  authenticate,
  authorize("BARBER"),
  getBarberMine
);

router.patch(
  "/appointments/:id/status",
  authenticate,
  authorize("BARBER"),
  updateBarberStatus
);

export default router;