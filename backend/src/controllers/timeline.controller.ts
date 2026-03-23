import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { getTraceTimeline } from "../services/timeline.service";

export async function getTimeline(req: AuthRequest, res: Response) {
  try {
    const { traceId } = req.params;
    const userId = req.user!.id;

    const timeline = await getTraceTimeline(traceId, userId);
    res.json(timeline);
  } catch (error: any) {
    res
      .status(error?.statusCode ?? 404)
      .json({ error: "Trace Timeline not found" });
  }
}
