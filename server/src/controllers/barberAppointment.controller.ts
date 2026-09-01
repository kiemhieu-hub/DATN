import { Request, Response } from "express";
import Appointment from "../models/Appointment"; // Điều chỉnh đường dẫn dẫn đến model Appointment của bạn nếu cần

// Định nghĩa Interface cho request có chứa thông tin user đăng nhập từ Auth Middleware
interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

/**
 * @desc    Lấy danh sách lịch hẹn của Barber
 * @route   GET /api/barber/appointments
 * @access  Private (BARBER)
 */
export const getBarberAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const barberId = req.user?._id;
    const { status, appointmentDate, dateFrom, dateTo } = req.query;

    if (!barberId) {
      return res.status(401).json({ success: false, message: "Không tìm thấy thông tin xác thực." });
    }

    // Xây dựng truy vấn tìm kiếm
    const query: any = { barber: barberId };

    if (status) {
      query.status = status;
    }

    if (appointmentDate) {
      query.appointmentDate = appointmentDate;
    } else if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) query.appointmentDate.$gte = dateFrom;
      if (dateTo) query.appointmentDate.$lte = dateTo;
    }

    // Lấy danh sách lịch hẹn và populate thông tin khách hàng/dịch vụ
    const appointments = await Appointment.find(query)
      .populate("customer", "fullName phone email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi lấy danh sách lịch hẹn.",
    });
  }
};

/**
 * @desc    Đánh dấu Barber đã xem lịch hẹn
 * @route   PATCH /api/barber/appointments/:id/viewed
 * @access  Private (BARBER)
 */
export const markBarberAppointmentViewed = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const barberId = req.user?._id;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, barber: barberId },
      { barberViewedAt: new Date() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu xem lịch hẹn thành công.",
      appointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi cập nhật thời gian xem.",
    });
  }
};

/**
 * @desc    Cập nhật trạng thái lịch hẹn (Bắt đầu / Kết thúc)
 * @route   PATCH /api/barber/appointments/:id/status
 * @access  Private (BARBER)
 */
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái lịch hẹn không hợp lệ.",
      });
    }

    const updateData: any = { status };
    if (reason) {
      updateData.cancellationReason = reason;
    }

    // SỬA TẠI ĐÂY: Tìm theo _id của lịch hẹn thay vì ràng buộc cả barber
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn trong hệ thống.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái lịch hẹn thành công.",
      appointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi cập nhật trạng thái lịch hẹn.",
    });
  }
};