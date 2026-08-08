import { Router } from "express";

import {
  createBarber,
  getBarberById,
  getBarbers,
  resetBarberPassword,
  updateBarber,
  updateBarberStatus,
} from "../controllers/adminBarber.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(
  authenticate,
  authorize("ADMIN")
);

router.get(
  "/",
  getBarbers
);

router.get(
  "/:id",
  getBarberById
);

router.post(
  "/",
  createBarber
);

router.put(
  "/:id",
  updateBarber
);

router.patch(
  "/:id/status",
  updateBarberStatus
);

router.patch(
  "/:id/reset-password",
  resetBarberPassword
);

export default router;
