import { Router } from "express";
import {
  getCandidates,
  sendInterviewInvite,
  submitMarketInsights,
  toggleShortlist,
} from "../controllers/hiringController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("hiring"));
router.get("/candidates", getCandidates);
router.patch("/candidates/:profileId/shortlist", toggleShortlist);
router.post("/candidates/:profileId/interview", sendInterviewInvite);
router.post("/insights", submitMarketInsights);

export default router;
