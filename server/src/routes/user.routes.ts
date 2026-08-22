import { Router } from "express";
import User from ".././models/User"; // Đường dẫn tới file model user.ts của bạn

const router = Router();

// GET /api/users - Lấy danh sách (hỗ trợ lọc ?role=BARBER&status=ACTIVE)
router.get("/", async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter: Record<string, any> = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Lấy chi tiết user cho trang TeamDetail
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
