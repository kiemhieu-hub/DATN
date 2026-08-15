import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
} from "../controllers/adminServiceCategory.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.patch("/:id/status", updateCategoryStatus);
router.delete("/:id", deleteCategory);

export default router;
