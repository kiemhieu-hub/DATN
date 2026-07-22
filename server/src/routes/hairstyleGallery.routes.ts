import { Router } from "express";

import { getPublicHairstyles } from "../controllers/hairstyleGallery.controller";

const router = Router();
router.get("/", getPublicHairstyles);

export default router;
