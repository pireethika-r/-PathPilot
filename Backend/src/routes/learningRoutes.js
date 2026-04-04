import { Router } from "express";
import {
  confirmStripeCheckoutSession,
  createStripeCheckoutSession,
  downloadBadge,
  downloadCertificate,
  enrollWithPayment,
  getCheckoutSummary,
  getCourseCatalog,
  getLearningDashboard,
  getPaymentHistory,
  updateLearningProgress,
} from "../controllers/learningController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("student"));
router.get("/courses", getCourseCatalog);
router.post("/checkout-summary", getCheckoutSummary);
router.post("/enroll", enrollWithPayment);
router.post("/stripe/checkout-session", createStripeCheckoutSession);
router.post("/stripe/confirm-session", confirmStripeCheckoutSession);
router.get("/dashboard", getLearningDashboard);
router.get("/payments", getPaymentHistory);
router.get("/badges/:badgeId/download", downloadBadge);
router.patch("/enrollments/:enrollmentId/progress", updateLearningProgress);
router.get("/enrollments/:enrollmentId/certificate", downloadCertificate);

export default router;
