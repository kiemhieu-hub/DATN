import { Router } from "express";
import { createService, deleteService, getService, getServices, updateService, updateStatus } from "../controllers/adminService.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", getServices);
router.get("/:id", getService);
router.post("/", createService);
router.put("/:id", updateService);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteService);

export default router;
