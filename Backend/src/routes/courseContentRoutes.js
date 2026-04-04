import express from "express";
import {
  createCourseContent,
  getCourseContent,
  updateCourseContent,
  deleteCourseContent
} from "../controllers/courseContentController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/course-content
 * @desc    Create course content (modules + lessons)
 * @access  Admin only
 */
router.post(
  "/",
  createCourseContent
);

/**
 * @route   GET /api/course-content/:courseId
 * @desc    Get course content by course ID
 * @access  Authenticated users
 */
router.get(
  "/:courseId",
  getCourseContent
);

/**
 * @route   PUT /api/course-content/:courseId
 * @desc    Update course content
 * @access  Admin only
 */
router.put(
  "/:courseId",
  protect,
  authorizeRoles("admin"),
  updateCourseContent
);

/**
 * @route   DELETE /api/course-content/:courseId
 * @desc    Delete course content
 * @access  Admin only
 */
router.delete(
  "/:courseId",
  protect,
  authorizeRoles("admin"),
  deleteCourseContent
);

export default router;