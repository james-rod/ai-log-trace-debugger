import { Router } from "express";
import {
  ingestTraceHandler,
  listTracesHandler,
  deleteTraceHandler,
} from "../controllers/trace.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/ping", (_req, res) =>
  res.json({ ok: true, route: "/traces/ping" }),
);
router.get("/", authMiddleware, listTracesHandler); // GET /traces
router.post("/ingest", authMiddleware, ingestTraceHandler); // POST /traces/ingest
router.delete("/:traceId", authMiddleware, deleteTraceHandler); // DELETE /traces/:traceId
export default router;
