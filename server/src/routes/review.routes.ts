import { Router } from "express";

import {
  createReview,
  getApprovedByBarber,
  getMine,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/barber/:barberId", getApprovedByBarber);
router.use(authenticate, authorize("CLIENT"));
router.get("/my", getMine);
router.post("/", createReview);

export default router;
