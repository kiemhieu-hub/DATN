import { Router } from "express";
import {
  createHairstyle,
  deleteHairstyle,
  getHairstyles,
  updateHairstyle,
  updateHairstyleStatus,
} from "../controllers/adminHairstyleGallery.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", getHairstyles);
router.post("/", createHairstyle);
router.put("/:id", updateHairstyle);
router.patch("/:id/status", updateHairstyleStatus);
router.delete("/:id", deleteHairstyle);

export default router;