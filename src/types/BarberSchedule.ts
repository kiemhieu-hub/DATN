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

export interface BarberUpcomingScheduleDay extends BarberScheduleDay {
  date: string;
  note?: string;
  source: "WEEKLY" | "OVERRIDE";
}

export interface GetBarberScheduleResponse {
  success: boolean;
  schedules: BarberUpcomingScheduleDay[];
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
