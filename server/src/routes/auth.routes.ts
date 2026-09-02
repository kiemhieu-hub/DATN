import { Router } from "express";

import {
  loginAdmin,
  loginBarber,
  loginClient,
  loginReceptionist,
  me,
  register,
  updateMe,
  forgotPassword,
  applyPasswordReset,
  updatePassword,
  logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { createRateLimit } from "../middleware/security";

const router = Router();
const authLimiter = createRateLimit(15 * 60 * 1000, 10);
const resetLimiter = createRateLimit(60 * 60 * 1000, 5);

router.post("/register", register);
router.post("/client/login", authLimiter, loginClient);
router.post("/barber/login", authLimiter, loginBarber);
router.post("/receptionist/login", authLimiter, loginReceptionist);
router.post("/admin/login", authLimiter, loginAdmin);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", applyPasswordReset);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, authorize("CLIENT"), updateMe);
router.patch("/change-password", authenticate, updatePassword);
router.post("/logout", authenticate, logout);

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
