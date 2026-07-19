export interface ScheduleBreak {
  startTime: string;
  endTime: string;
}

export interface BarberScheduleDay {
  _id?: string;
  barber?: string;

  dayOfWeek: number;
  startTime: string;
  endTime: string;

  breaks: ScheduleBreak[];
  isWorking: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface GetBarberScheduleResponse {
  success: boolean;
  schedules: BarberScheduleDay[];
}

export interface UpdateBarberScheduleResponse {
  success: boolean;
  message: string;
  schedules: BarberScheduleDay[];
}

export interface UpdateBarberScheduleDayResponse {
  success: boolean;
  message: string;
  schedule: BarberScheduleDay;
}