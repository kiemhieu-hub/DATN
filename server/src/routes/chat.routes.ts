import { Router } from "express";
import { conversations, messages, send } from "../controllers/chat.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("CLIENT", "BARBER", "RECEPTIONIST"));
router.get("/conversations", authorize("RECEPTIONIST"), conversations);
router.get("/messages", messages);
router.post("/messages", send);
export default router;
