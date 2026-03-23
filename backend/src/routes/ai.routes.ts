import { Router } from "express";
import { analyzeTraceHandler } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/analyze", authMiddleware, analyzeTraceHandler);

export default router;
