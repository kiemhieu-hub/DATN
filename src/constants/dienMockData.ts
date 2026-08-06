// src/constants/dienMockData.ts

// 1. DATA PROFILE CÁC BARBER (Phục vụ chức năng: Quản lý hồ sơ barber)
export interface BarberProfile {
  id: number;
  fullName: string;
  avatarUrl: string;
  phone: string;
  level: 'Stylist' | 'Master Barber' | 'Junior';
  experienceYear: number;
  averageRating: number;
  totalReviews: number;
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
}

export const mockBarberProfiles: BarberProfile[] = [
  {
    id: 101,
    fullName: "Nguyễn Văn Anh (Stylist Anh)",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    phone: "0912345678",
    level: "Master Barber",
    experienceYear: 5,
    averageRating: 4.9,
    totalReviews: 124,
    status: "ACTIVE",
    description: "Chuyên các kiểu tóc Modern Pompadour, Undercut và cạo râu kiểu Ý."
  },
  {
    id: 102,
    fullName: "Trần Minh Đức",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    phone: "0987654321",
    level: "Stylist",
    experienceYear: 3,
    averageRating: 4.7,
    totalReviews: 85,
    status: "ACTIVE",
    description: "Xu hướng tóc Hàn Quốc, Layer, Mullet và nhuộm màu thời trang."
  }
];


// 2. DATA LỊCH LÀM VIỆC (Phục vụ chức năng: Xem & Quản lý lịch làm việc của Barber)
export interface BarberSchedule {
  id: number;
  barberId: number;
  barberName: string;
  workDate: string; // Định dạng YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  isAvailable: boolean; // Ca này còn trống để khách đặt không
}

export const mockBarberSchedules: BarberSchedule[] = [
  { id: 1, barberId: 101, barberName: "Nguyễn Văn Anh", workDate: "2026-07-13", startTime: "08:00", endTime: "12:00", isAvailable: false },
  { id: 2, barberId: 101, barberName: "Nguyễn Văn Anh", workDate: "2026-07-13", startTime: "13:30", endTime: "17:30", isAvailable: true },
  { id: 3, barberId: 102, barberName: "Trần Minh Đức", workDate: "2026-07-13", startTime: "08:00", endTime: "12:00", isAvailable: true },
  { id: 4, barberId: 102, barberName: "Trần Minh Đức", workDate: "2026-07-13", startTime: "13:30", endTime: "17:30", isAvailable: false }
];


// 3. DATA LỊCH HẸN CHI TIẾT (Phục vụ: Danh sách lịch hẹn, Xác nhận & Cập nhật trạng thái)
export interface BookingAppointment {
  id: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  barberName: string;
  bookingDate: string;
  timeSlot: string;
  services: string[]; // Các dịch vụ khách chọn
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID';
}

export const mockBookingAppointments: BookingAppointment[] = [
  {
    id: 1001,
    bookingCode: "BK-9981",
    customerName: "Nguyễn Kiêm Hiếu",
    customerPhone: "0904445556",
    barberName: "Nguyễn Văn Anh",
    bookingDate: "2026-07-13",
    timeSlot: "09:00 - 09:30",
    services: ["Cắt tóc Barber", "Gội đầu massage"],
    totalAmount: 180000,
    status: "PENDING", // Đang chờ Điển xác nhận duyệt lịch này
    paymentStatus: "UNPAID"
  },
  {
    id: 1002,
    bookingCode: "BK-1234",
    customerName: "Lê Hoàng Hải",
    customerPhone: "0933221100",
    barberName: "Trần Minh Đức",
    bookingDate: "2026-07-13",
    timeSlot: "14:00 - 14:45",
    services: ["Combo Cắt + Uốn Premlock"],
    totalAmount: 450000,
    status: "CONFIRMED", // Đã xác nhận duyệt lịch thành công
    paymentStatus: "PAID"
  },
  {
    id: 1003,
    bookingCode: "BK-5678",
    customerName: "Phạm Thanh Sơn",
    customerPhone: "0977889900",
    barberName: "Nguyễn Văn Anh",
    bookingDate: "2026-07-12",
    timeSlot: "16:00 - 16:30",
    services: ["Cạo râu dưỡng da"],
    totalAmount: 80000,
    status: "COMPLETED", // Đã hoàn thành xong lịch hẹn ngày hôm qua
    paymentStatus: "PAID"
  }
];