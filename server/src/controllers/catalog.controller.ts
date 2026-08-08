import {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  getActiveBarberById,
  getActiveBarbers,
  getActiveServices,
} from "../services/catalog.service";

import AppError from "../utils/AppError";


export const getServices = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services =
      await getActiveServices();

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    next(error);
  }
};


export const getBarbers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barbers =
      await getActiveBarbers();

    res.status(200).json({
      success: true,
      barbers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/catalog/barbers/:id
 * Lấy chi tiết một Barber.
 */
export const getBarberDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = req.params.id;

    if (
      typeof barberId !== "string" ||
      !barberId.trim()
    ) {
      throw new AppError(
        "Mã Barber không hợp lệ",
        400
      );
    }

    const barber =
      await getActiveBarberById(
        barberId.trim()
      );

    if (!barber) {
      throw new AppError(
        "Không tìm thấy Barber",
        404
      );
    }

    res.status(200).json({
      success: true,
      barber,
    });
  } catch (error) {
    next(error);
  }
};