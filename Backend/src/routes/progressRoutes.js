import express from "express";
import { saveProgress, getProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveProgress);
router.get("/:courseId", protect, getProgress);

export default router;