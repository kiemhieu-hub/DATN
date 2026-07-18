import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import type { UserStatus } from "../models/User";

import * as adminBarberService from "../services/adminBarber.service";

type BarberStatusFilter =
  | UserStatus
  | "ALL";

const getStringQuery = (
  value: unknown
): string | undefined => {
  return typeof value === "string"
    ? value
    : undefined;
};

const getNumberQuery = (
  value: unknown
): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  return parsedValue;
};

const getRouteParam = (
  value: string | string[] | undefined,
  fieldName: string
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(
      `${fieldName} không hợp lệ`
    );
  }

  return normalizedValue;
};


export const getBarbers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const keyword = getStringQuery(
      req.query.keyword
    );

    const status = getStringQuery(
      req.query.status
    ) as BarberStatusFilter | undefined;

    const page = getNumberQuery(
      req.query.page
    );

    const limit = getNumberQuery(
      req.query.limit
    );

    const result =
      await adminBarberService.getAdminBarbers(
        {
          keyword,
          status,
          page,
          limit,
        }
      );

    res.status(200).json({
      success: true,
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getBarberById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = getRouteParam(
      req.params.id,
      "Mã Barber"
    );

    const barber =
      await adminBarberService.getAdminBarberById(
        barberId
      );

    res.status(200).json({
      success: true,
      barber,
    });
  } catch (error) {
    next(error);
  }
};


export const createBarber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barber =
      await adminBarberService.createAdminBarber(
        {
          fullName:
            req.body.fullName,

          email:
            req.body.email,

          phone:
            req.body.phone,

          password:
            req.body.password,

          avatar:
            req.body.avatar,

          bio:
            req.body.bio,

          experienceYears:
            req.body.experienceYears,

          specialtyIds:
            req.body.specialtyIds,
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Tạo Barber thành công",
      barber,
    });
  } catch (error) {
    next(error);
  }
};


export const updateBarber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = getRouteParam(
      req.params.id,
      "Mã Barber"
    );

    const barber =
      await adminBarberService.updateAdminBarber(
        barberId,
        {
          fullName:
            req.body.fullName,

          phone:
            req.body.phone,

          avatar:
            req.body.avatar,

          bio:
            req.body.bio,

          experienceYears:
            req.body.experienceYears,

          specialtyIds:
            req.body.specialtyIds,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Cập nhật Barber thành công",
      barber,
    });
  } catch (error) {
    next(error);
  }
};


export const updateBarberStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = getRouteParam(
      req.params.id,
      "Mã Barber"
    );

    const barber =
      await adminBarberService.updateAdminBarberStatus(
        barberId,
        {
          status:
            req.body.status as UserStatus,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Cập nhật trạng thái Barber thành công",
      barber,
    });
  } catch (error) {
    next(error);
  }
};


export const resetBarberPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = getRouteParam(
      req.params.id,
      "Mã Barber"
    );

    const newPassword =
      typeof req.body.newPassword ===
      "string"
        ? req.body.newPassword
        : "";

    const barber =
      await adminBarberService.resetAdminBarberPassword(
        barberId,
        newPassword
      );

    res.status(200).json({
      success: true,
      message:
        "Đặt lại mật khẩu Barber thành công",
      barber,
    });
  } catch (error) {
    next(error);
  }
};