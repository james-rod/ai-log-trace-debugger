import type { Request, Response } from "express";
import type { AuthRequest } from "../types/auth";
import { ingestTrace } from "../services/traceIngestion.service";
import { listTraces, softDeleteTrace } from "../services/trace.service";

export async function ingestTraceHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { traceName, logs } = req.body;

  // ✅ Validation: logs must be an array
  if (!Array.isArray(logs)) {
    return res.status(400).json({
      error: "logs must be an array",
    });
  }

  const trace = await ingestTrace({
    userId,
    traceName, // ✅ make sure this is passed
    logs,
  });

  res.status(201).json(trace);
}

// GET /traces
export async function listTracesHandler(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const traces = await listTraces(userId);
  res.json(traces);
}

// DELETE /traces/:traceId
export async function deleteTraceHandler(req: AuthRequest, res: Response) {
  const { traceId } = req.params;
  const userId = req.user!.id;

  const result = await softDeleteTrace(traceId, userId);

  if (result.count === 0) {
    return res
      .status(404)
      .json({ error: "Trace not found or already deleted" });
  }

  res.json({ message: "Trace deleted successfully" });
}
