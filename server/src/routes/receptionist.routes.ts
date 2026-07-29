import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { list, update } from "../controllers/receptionistSchedule.controller";
const router=Router();
router.use(authenticate,authorize("RECEPTIONIST","ADMIN"));
router.get("/barbers",list);
router.put("/barbers/:id/schedule",update);
export default router;
