import { Router } from "express";

import {
  getBarberMine,
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

export default router;
