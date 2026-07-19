import { Router } from "express";

import {
  login,
  me,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

router.get(
  "/client-only",
  authenticate,
  authorize("CLIENT"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Bạn đang truy cập API dành cho CLIENT",
    });
  }
);

router.get(
  "/admin-only",
  authenticate,
  authorize("ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Bạn đang truy cập API dành cho ADMIN",
    });
  }
);

export default router;