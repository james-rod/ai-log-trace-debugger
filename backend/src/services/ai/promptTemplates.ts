//  ← prompt engineering
export function buildTraceAnalysisPrompt(args: {
  traceId: string;
  traceName: string | null;
  metrics: any;
  events: any[];
}) {
  const { traceId, traceName, metrics, events } = args;

  const condensedEvents = events.slice(0, 30).map((e, i) => {
    if (e.kind === "LOG") {
      const log = e.data;
      return {
        i,
        kind: "LOG",
        at: e.at,
        level: log.level,
        message: log.message,
        // keep only small metadata fields
        metadata: log.metadata
          ? {
              latencyMs: log.metadata.latencyMs ?? null,
              tokens: log.metadata.tokens ?? null,
            }
          : null,
      };
    }

    const step = e.data;
    return {
      i,
      kind: "STEP",
      at: e.at,
      stepType: step.stepType,
      stepIndex: step.stepIndex,
      latencyMs: step.latencyMs ?? null,
      tokenUsage: step.tokenUsage ?? null,
      prompt: step.prompt ?? null,
      response: step.response ?? null,
      toolName: step.toolName ?? null,
      errorMessage: step.errorMessage ?? null,
    };
  });

  return `
  You are an AI debugging assistant for an "AI Log & Trace Debugger" (Chrome DevTools for AI agents).

  Your Job: 

  - Diagnose likely root causes (ranked)
  - Provide actionable fixes
  - Cite evidence by event indices (use the "i" field)
  - Be concise and developer-focused

  Trace: 
  - id: ${traceId}
  - name: ${traceName ?? "Untitled"}
  - metrics: ${JSON.stringify(metrics)}

  Events (condensed):
  ${JSON.stringify(condensedEvents)}

  Return a structured diagnosis with: 
  - summary (2-4 sentences)
  - confidence: HIGH | MED | LOW
  - rootCauses: 2-5 items, ranked, each included evidenceEventIndices
  - fixes: 3-8 bullet-style fixes
  `.trim();
}
