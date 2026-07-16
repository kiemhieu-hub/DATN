import { Router } from "express";

import {
  cancelMine,
  create,
  getMine,
} from "../controllers/appointment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const appointmentRouter = Router();

appointmentRouter.use(
  authenticate,
  authorize("CLIENT")
);

appointmentRouter.post("/", create);
appointmentRouter.get("/my", getMine);
appointmentRouter.patch("/:id/cancel", cancelMine);

export default appointmentRouter;