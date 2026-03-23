import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { getTraceTimeline } from "../services/timeline.service";
import { analyzeTraceWithLLM } from "../services/ai/langchain.service";
import { getSavedAnalysis, saveAnalysis } from "../services/analysis.service";

export async function analyzeTraceHandler(req: AuthRequest, res: Response) {
  console.time("ai/analyze total");

  const body = req.body as any;
  const traceId = body.traceId ?? body.id;

  // Force re-run via query param
  const reanalyze = String(req.query.reanalyze ?? "false") === "true";

  // TTL config
  const ttlMinutes = Number(process.env.AI_ANALYSIS_TTL_MINUTES) || 30;
  const maxAgeMs = ttlMinutes * 60 * 1000;

  if (!traceId) {
    console.timeEnd("ai/analyze total");
    return res.status(400).json({ error: "traceId is required" });
  }

  // ✅ Try cache (unless forced)
  if (!reanalyze) {
    const cached = await getSavedAnalysis(traceId);

    if (cached) {
      const ageMs = Date.now() - new Date(cached.updatedAt).getTime();

      // Fresh enough → return cached
      if (ageMs <= maxAgeMs) {
        console.timeEnd("ai/analyze total");
        return res.json({
          cached: true,
          cacheAgeSeconds: Math.floor(ageMs / 1000),
          ttlMinutes,
          traceId,
          model: cached.model,
          diagnosis: cached.diagnosis,
          updatedAt: cached.updatedAt,
        });
      }
    }
  }

  // ✅ Cache miss or expired → live analysis
  console.time("load timeline");
  const userId = req.user!.id;
  const timeline = await getTraceTimeline(traceId, userId);
  console.timeEnd("load timeline");

  console.time("llm analysis");
  const diagnosis = await analyzeTraceWithLLM({
    traceId: timeline.trace.id,
    traceName: timeline.trace.name ?? null,
    metrics: timeline.metrics ?? null,
    events: timeline.events ?? [],
  });
  console.timeEnd("llm analysis");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const saved = await saveAnalysis({
    traceId,
    diagnosis,
    model,
    promptVer: "v1",
  });

  console.timeEnd("ai/analyze total");

  return res.json({
    cached: false,
    ttlMinutes,
    traceId,
    model: saved.model,
    diagnosis: saved.diagnosis,
    updatedAt: saved.updatedAt,
  });
}
