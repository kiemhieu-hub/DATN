import { Router } from "express";

import {
  addFavoriteHairstyle,
  getMyFavoriteHairstyles,
  removeFavoriteHairstyle,
} from "../controllers/favoriteHairstyle.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("CLIENT"));
router.get("/", getMyFavoriteHairstyles);
router.post("/", addFavoriteHairstyle);
router.delete("/:id", removeFavoriteHairstyle);

export default router;
