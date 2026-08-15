import { Router } from "express";
import { createReview, getMine, getBarberReviews } from "../controllers/review.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// Route công khai: Lấy danh sách đánh giá đã duyệt của 1 Barber (Ai cũng xem được)
router.get("/barber/:barberId", getBarberReviews);

// Các route bên dưới bắt buộc phải đăng nhập với vai trò CLIENT
router.use(authenticate, authorize("CLIENT"));
router.get("/my", getMine);
router.post("/", createReview);

export default router;