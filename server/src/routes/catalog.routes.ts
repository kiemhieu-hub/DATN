import { Router } from "express";

import {
  getBarberDetail,
  getBarbers,
  getServices,
} from "../controllers/catalog.controller";

const router = Router();

router.get(
  "/services",
  getServices
);

router.get(
  "/barbers",
  getBarbers
);

router.get(
  "/barbers/:id",
  getBarberDetail
);

export default router;