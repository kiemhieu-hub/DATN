import { Router } from "express";

import {
  getClient,
  getClients,
  updateClientStatus,
  updateUserRole,
} from "../controllers/adminUser.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(
  authenticate,
  authorize("ADMIN")
);

router.get("/", getClients);
router.get("/:id", getClient);
router.patch("/:id/status", updateClientStatus);
router.patch("/:id/role", updateUserRole);

export default router;