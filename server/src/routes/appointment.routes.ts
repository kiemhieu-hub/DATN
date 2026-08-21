import { Router } from "express";

import {
  cancelMine,
  create,
  getSlots,
  getMine,
  rescheduleMine,
} from "../controllers/appointment.controller";


import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/available-slots",
  getSlots
);


router.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  create
);


router.get(
  "/my",
  authenticate,
  authorize("CLIENT"),
  getMine
);


router.patch(
  "/:id/cancel",
  authenticate,
  authorize("CLIENT"),
  cancelMine
);

router.patch(
  "/:id/reschedule",
  authenticate,
  authorize("CLIENT"),
  rescheduleMine
);

export default router;
