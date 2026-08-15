import { Router } from "express";

import {
  getBarberMine,
  markBarberViewed,
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
  "/appointments/:id/viewed",
  authenticate,
  authorize("BARBER"),
  markBarberViewed
);

export default router;
