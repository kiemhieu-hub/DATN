import { Router } from "express";
import {
  getBarberAppointments,
  markBarberAppointmentViewed,
  updateAppointmentStatus,
} from ".././controllers/barberAppointment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// Tất cả các route bên dưới đều bắt buộc phải đăng nhập và có quyền BARBER
router.use(authenticate, authorize("BARBER"));

/**
 * @route   GET /api/barber/appointments
 * @desc    Lấy danh sách lịch hẹn của Barber
 */
router.get("/", getBarberAppointments);

/**
 * @route   PATCH /api/barber/appointments/:id/viewed
 * @desc    Đánh dấu Barber đã xem lịch hẹn
 */
router.patch("/:id/viewed", markBarberAppointmentViewed);

/**
 * @route   PATCH /api/barber/appointments/:id/status
 * @desc    Cập nhật trạng thái lịch hẹn (Bắt đầu / Kết thúc / ...)
 */
router.patch("/:id/status", updateAppointmentStatus);

export default router;