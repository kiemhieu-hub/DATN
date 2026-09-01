export type StaffNotificationKind =
  | "NEW_APPOINTMENT"
  | "UPCOMING"
  | "NO_SHOW"
  | "WAITING_PAYMENT"
  | "APPOINTMENT_CHANGED"
  | "PAYMENT";

export interface StaffNotificationAppointment {
  _id: string;
  appointmentCode: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface StaffNotification {
  _id: string;
  title: string;
  message: string;
  kind: StaffNotificationKind;
  appointment?:
    | string
    | StaffNotificationAppointment;
  isRead: boolean;
  createdAt: string;
}

export interface StaffNotificationResponse {
  success: boolean;
  items: StaffNotification[];
  unreadCount: number;
}
