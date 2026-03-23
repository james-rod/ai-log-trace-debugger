// We compute metrics from TraceSteps, not raw logs.

import { prisma } from "../lib/prisma";

export async function createMetrics(traceId: string, steps: any[]) {
  const totalLatency = steps.reduce(
    (sum, step) => sum + (step.latencyMs ?? 0),
    0
  );

  const totalTokens = steps.reduce(
    (sum, step) => sum + (step.tokenUsage ?? 0),
    0
  );

  const estimatedCost = totalTokens
    ? totalTokens * 0.000002 // example OpenAI pricing
    : 0;

  await prisma.metric.create({
    data: {
      traceId,
      totalLatency,
      totalTokens,
      estimatedCost,
    },
  });
}
