import { Router } from "express";
import {
  changeAdminReviewStatus,
  getAdminReviews,
  removeAdminReview,
} from "../controllers/adminReview.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/", getAdminReviews);
router.patch("/:id/status", changeAdminReviewStatus);
router.delete("/:id", removeAdminReview);

export default router;
