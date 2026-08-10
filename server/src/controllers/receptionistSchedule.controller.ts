import type { NextFunction, Request, Response } from "express";
import * as service from "../services/receptionistSchedule.service";
const id = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || "" : value || "";
export const list = async (_req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true, items:await service.listBarberSchedules() }); } catch(e){next(e);} };
export const update = async (req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true,message:"Cập nhật lịch làm việc thành công",schedules:await service.updateBarberSchedule(id(req.params.id),req.body.schedules) }); } catch(e){next(e);} };
export const dayDetail = async (req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true, ...(await service.getBarberDayDetail(id(req.params.id), id(req.query.date as string))) }); } catch(e){next(e);} };
export const saveOverride = async (req: Request,res: Response,next: NextFunction) => { try { res.json({ success:true,message:"Đã lưu lịch riêng theo ngày",override:await service.saveDateOverride(id(req.params.id),req.body) }); } catch(e){next(e);} };
export const removeOverride = async (req: Request,res: Response,next: NextFunction) => { try { await service.deleteDateOverride(id(req.params.id),id(req.query.date as string)); res.json({success:true,message:"Đã bỏ lịch riêng, hệ thống quay lại lịch tuần mặc định"}); } catch(e){next(e);} };
