import api from "./api";
import type { BarberScheduleDay } from "../types/BarberSchedule";
export interface ReceptionBarberSchedule { barber:{_id:string;fullName:string;email:string;phone:string};schedules:BarberScheduleDay[] }
export const getReceptionBarberSchedules=async()=>(await api.get<{success:boolean;items:ReceptionBarberSchedule[]}>("/receptionist/barbers")).data;
export const saveReceptionBarberSchedule=async(id:string,schedules:BarberScheduleDay[])=>(await api.put(`/receptionist/barbers/${id}/schedule`,{schedules})).data;
