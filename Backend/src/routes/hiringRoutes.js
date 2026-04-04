import { Router } from "express";
import {
  deleteMarketInsight,
  downloadCandidateCv,
  getCandidates,
  getMarketInsights,
  sendInterviewInvite,
  submitMarketInsights,
  toggleShortlist,
  updateMarketInsight,
} from "../controllers/hiringController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("hiring"));
router.get("/candidates", getCandidates);
router.get("/candidates/:profileId/cv", downloadCandidateCv);
router.patch("/candidates/:profileId/shortlist", toggleShortlist);
router.post("/candidates/:profileId/interview", sendInterviewInvite);
router.get("/insights", getMarketInsights);
router.post("/insights", submitMarketInsights);
router.put("/insights/:insightId", updateMarketInsight);
router.delete("/insights/:insightId", deleteMarketInsight);

export default router;
