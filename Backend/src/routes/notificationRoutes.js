import { Router } from "express";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

export default router;
