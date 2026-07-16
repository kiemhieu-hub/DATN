export type AppointmentStatus =| "PENDING"| "CONFIRMED"| "IN_PROGRESS"| "COMPLETED"| "CANCELLED";

export interface AppointmentService {
  name: string;
  price: number;
}

export interface Appointment {
  _id: string;

  client: string;

  services: AppointmentService[];

  totalPrice: number;

  barberName: string;

  appointmentDate: string;

  timeSlot: string;

  durationMinutes: number;

  endTime: string;

  note: string;

  status: AppointmentStatus;

  cancelReason: string;

  createdAt: string;

  updatedAt: string;
}