import express from "express";
import { createCourse } from "../controllers/courseController.js";

const router = express.Router();

// POST → create course
router.post("/", createCourse);

export default router;