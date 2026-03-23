import { prisma } from "../lib/prisma";

export async function getTraceTimeline(traceId: string, userId: string) {
  const trace = await prisma.trace.findFirst({
    where: { id: traceId, userId },
    include: {
      steps: { orderBy: { createdAt: "asc" } },
      logs: { orderBy: { createdAt: "asc" } },
      metrics: true,
    },
  });

  if (!trace) {
    const err: any = new Error("Trace Timeline not found");
    err.statusCode = 404;
    throw err;
  }

  const events = [
    ...trace.steps.map((s) => ({
      kind: "STEP" as const,
      at: s.createdAt,
      data: s,
    })),
    ...trace.logs.map((l) => ({
      kind: "LOG" as const,
      at: l.createdAt,
      data: l,
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return {
    trace: {
      id: trace.id,
      name: trace.name,
      createdAt: trace.createdAt,
    },
    events,
    metrics: trace.metrics,
  };
}
