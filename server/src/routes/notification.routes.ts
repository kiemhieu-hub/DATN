import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  getNotifications,
  getUnreadNotificationsCount,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);

router.get("/unread-count", getUnreadNotificationsCount);

router.patch("/:notificationId/read", readNotification);

router.patch("/read-all", readAllNotifications);

router.delete("/:notificationId", removeNotification);

export default router;
