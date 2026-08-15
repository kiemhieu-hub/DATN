import { Router } from "express";

import { getDashboard } from "../controllers/barberDashboard.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("BARBER"),
  getDashboard
);

export default router;