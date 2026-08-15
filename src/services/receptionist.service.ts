import api from "./api";
import type { BarberScheduleDay } from "../types/BarberSchedule";
export interface ReceptionDateOverride {
  _id: string;
  barber: string;
  date: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  note: string;
}

export interface ScheduleChangeHistoryItem {
  _id: string;
  changeType:
    | "WEEKLY_UPDATED"
    | "DATE_OVERRIDE_SAVED"
    | "DATE_OVERRIDE_REMOVED";
  effectiveDate?: string;
  before?: unknown;
  after?: unknown;
  note: string;
  actor?: {
    _id: string;
    fullName: string;
    role: "ADMIN" | "RECEPTIONIST";
  };
  createdAt: string;
}

export interface ReceptionBarberSchedule {
  barber: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    staffType: "HAIR" | "CARE";
  };
  schedules: BarberScheduleDay[];
  dateOverrides: ReceptionDateOverride[];
}
export const getReceptionBarberSchedules=async()=>(await api.get<{success:boolean;items:ReceptionBarberSchedule[]}>("/receptionist/barbers")).data;
export const saveReceptionBarberSchedule=async(id:string,schedules:BarberScheduleDay[])=>(await api.put(`/receptionist/barbers/${id}/schedule`,{schedules})).data;

export interface BarberDayBooking {
  startTime: string;
  endTime: string;
  appointmentId: string;
  appointmentCode: string;
  customerName: string;
  status: string;
}
export interface BarberDaySlot {
  startTime: string;
  endTime: string;
  booked: boolean;
  booking?: BarberDayBooking;
}
export interface BarberDayDetail {
  success: boolean;
  barber: ReceptionBarberSchedule["barber"];
  date: string;
  source: "WEEKLY" | "OVERRIDE";
  schedule: { startTime:string;endTime:string;isWorking:boolean;note?:string } | null;
  slots: BarberDaySlot[];
}
export const getReceptionBarberDayDetail=async(id:string,date:string)=>(await api.get<BarberDayDetail>(`/receptionist/barbers/${id}/day-detail`,{params:{date}})).data;
export const saveReceptionDateOverride = async (
  id: string,
  data: {
    date: string;
    startTime: string;
    endTime: string;
    isWorking: boolean;
    note: string;
  }
) =>
  (
    await api.put<{
      success: boolean;
      message: string;
      override: ReceptionDateOverride;
    }>(`/receptionist/barbers/${id}/date-override`, data)
  ).data;
export const removeReceptionDateOverride=async(id:string,date:string)=>(await api.delete(`/receptionist/barbers/${id}/date-override`,{params:{date}})).data;

export const getReceptionScheduleHistory = async (id: string) =>
  (
    await api.get<{
      success: boolean;
      items: ScheduleChangeHistoryItem[];
    }>(`/receptionist/barbers/${id}/schedule-history`)
  ).data;
