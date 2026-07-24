import type { NextFunction, Request, Response } from "express";
import * as service from "../services/receptionistSchedule.service";
const id = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || "" : value || "";
export const list = async (_req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true, items:await service.listBarberSchedules() }); } catch(e){next(e);} };
export const update = async (req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true,message:"Cập nhật lịch làm việc thành công",schedules:await service.updateBarberSchedule(id(req.params.id),req.body.schedules) }); } catch(e){next(e);} };
