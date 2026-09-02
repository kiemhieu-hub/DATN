import { Router } from "express";

import { getDashboard } from "../controllers/adminDashboard.controller";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPTIONIST"),
  getDashboard
);

export default router;
