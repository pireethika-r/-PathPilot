import { Router } from "express";
import {
  getAdminOverview,
  getAllStudentProfiles,
  getStudentProfileById,
  updateStudentProfileStatus,
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));
router.get("/overview", getAdminOverview);
router.get("/students", getAllStudentProfiles);
router.get("/students/:profileId", getStudentProfileById);
router.patch("/students/:profileId/status", updateStudentProfileStatus);

export default router;
