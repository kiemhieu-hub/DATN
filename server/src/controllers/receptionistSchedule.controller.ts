import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate";
import AppError from "../utils/AppError";
import * as service from "../services/receptionistSchedule.service";

const getValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const getActorId = (req: AuthenticatedRequest) => {
  if (!req.user) throw new AppError("Bạn chưa đăng nhập", 401);
  return req.user.userId;
};

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      items: await service.listBarberSchedules(),
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedules = await service.updateBarberSchedule(
      getValue(req.params.id),
      req.body.schedules,
      getActorId(req)
    );

    res.json({
      success: true,
      message: "Cập nhật lịch làm việc thành công",
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const dayDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      ...(await service.getBarberDayDetail(
        getValue(req.params.id),
        getValue(req.query.date as string)
      )),
    });
  } catch (error) {
    next(error);
  }
};

export const saveOverride = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const override = await service.saveDateOverride(
      getValue(req.params.id),
      req.body,
      getActorId(req)
    );

    res.json({
      success: true,
      message: "Đã lưu lịch riêng theo ngày",
      override,
    });
  } catch (error) {
    next(error);
  }
};

export const removeOverride = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await service.deleteDateOverride(
      getValue(req.params.id),
      getValue(req.query.date as string),
      getActorId(req)
    );

    res.json({
      success: true,
      message: "Đã bỏ lịch riêng, hệ thống quay lại lịch tuần mặc định",
    });
  } catch (error) {
    next(error);
  }
};

export const history = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      items: await service.getScheduleChangeHistory(getValue(req.params.id)),
    });
  } catch (error) {
    next(error);
  }
};

export const leaveRequests = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, items: await service.listLeaveRequests() });
  } catch (error) {
    next(error);
  }
};

export const decideLeaveRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const request = await service.reviewLeaveRequest(
      getValue(req.params.id),
      req.body.decision,
      typeof req.body.reviewNote === "string" ? req.body.reviewNote : "",
      getActorId(req)
    );
    res.json({
      success: true,
      message: req.body.decision === "APPROVED" ? "Đã chấp nhận yêu cầu nghỉ" : "Đã từ chối yêu cầu nghỉ",
      request,
    });
  } catch (error) {
    next(error);
  }
};
