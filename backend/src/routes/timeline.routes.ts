import { Router } from "express";
import { getTimeline } from "../controllers/timeline.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:traceId", authMiddleware, getTimeline);
export default router;
