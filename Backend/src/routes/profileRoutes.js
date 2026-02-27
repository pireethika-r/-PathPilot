import { Router } from "express";
import {
  getMyProfile,
  upsertMyProfile,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upsertMyProfile);

export default router;
