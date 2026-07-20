import { Router } from "express";

import {
  getClient,
  getClients,
  updateClientStatus,
  deleteClient,
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
router.delete("/:id", deleteClient);

export default router;
