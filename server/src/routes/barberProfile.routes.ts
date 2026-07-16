import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/barberProfile.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/me",
  authenticate,
  authorize("BARBER"),
  getMyProfile
);

router.put(
  "/me",
  authenticate,
  authorize("BARBER"),
  updateMyProfile
);

export default router;