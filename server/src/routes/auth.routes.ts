import { Router } from "express";

import {
  loginAdmin,
  loginBarber,
  loginClient,
  loginReceptionist,
  me,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.post("/register", register);
router.post("/client/login", loginClient);
router.post("/barber/login", loginBarber);
router.post("/receptionist/login", loginReceptionist);
router.post("/admin/login", loginAdmin);
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
