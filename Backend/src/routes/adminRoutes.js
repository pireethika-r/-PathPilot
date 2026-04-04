import { Router } from "express";
import {
  approveStudentProfile,
  createAdminCourse,
  downloadStudentCv,
  getAdminOverview,
  getAdminCourses,
  getAllStudentProfiles,
  getStudentProfileById,
  requestStudentProfileUpdate,
  updateAdminCourse,
  updateStudentProfileStatus,
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));
router.get("/overview", getAdminOverview);
router.get("/students", getAllStudentProfiles);
router.get("/students/:profileId", getStudentProfileById);
router.get("/students/:profileId/cv", downloadStudentCv);
router.patch("/students/:profileId/status", updateStudentProfileStatus);
router.patch("/students/:profileId/approve", approveStudentProfile);
router.patch("/students/:profileId/request-update", requestStudentProfileUpdate);
router.get("/courses", getAdminCourses);
router.post("/courses", createAdminCourse);
router.patch("/courses/:courseId", updateAdminCourse);

export default router;
