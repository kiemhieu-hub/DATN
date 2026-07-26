import { Router } from "express";

import {
  listNotifications,
  readAllNotifications,
  readNotification,
} from "../controllers/staffNotification.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(
  authenticate,
  authorize("ADMIN", "RECEPTIONIST")
);
router.get("/", listNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);

export default router;
