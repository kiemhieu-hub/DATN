import { Router } from "express";

import { createReview, getMine } from "../controllers/review.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("CLIENT"));
router.get("/my", getMine);
router.post("/", createReview);

export default router;
