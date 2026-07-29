import { Router } from "express";
import { changeBarber, deleteAppointment, getAppointment, getAppointments, reopenNoShow, reschedule, updateServices, updateStatus } from "../controllers/adminAppointment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate, authorize("ADMIN", "RECEPTIONIST"));
router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.patch("/:id/status", updateStatus);
router.patch("/:id/barber", changeBarber);
router.patch("/:id/reopen", reopenNoShow);
router.patch("/:id/reschedule", reschedule);
router.patch("/:id/services", updateServices);
router.delete("/:id", authorize("ADMIN"), deleteAppointment);
export default router;
