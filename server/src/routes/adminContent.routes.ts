import { Router } from "express";

import {
  getHairstyles,
  getReviews,
  getServiceCategories,
  getVouchers,
  removeHairstyle,
  removeReview,
  removeServiceCategory,
  removeVoucher,
} from "../controllers/adminContent.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/vouchers", getVouchers);
router.delete("/vouchers/:id", removeVoucher);
router.get("/reviews", getReviews);
router.delete("/reviews/:id", removeReview);
router.get("/service-categories", getServiceCategories);
router.delete("/service-categories/:id", removeServiceCategory);
router.get("/hairstyle-gallery", getHairstyles);
router.delete("/hairstyle-gallery/:id", removeHairstyle);

export default router;
