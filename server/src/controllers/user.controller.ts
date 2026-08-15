import { Request, Response } from "express";
import User from "./../models/User"; // Đảm bảo đúng tên file user.ts

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status } = req.query;
    const query: Record<string, any> = {};

    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi máy chủ khi lấy thông tin chi tiết người dùng",
      error: error.message,
    });
  }
};