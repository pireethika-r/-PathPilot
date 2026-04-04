import express from "express";
import {
  getCareerRecommendations,
  getCoursesByCareer
} from "../controllers/careerController.js";

const router = express.Router();

// Career recommendation
router.post("/recommend", getCareerRecommendations);

// Course suggestions
router.get("/courses/:career", getCoursesByCareer);

export default router;