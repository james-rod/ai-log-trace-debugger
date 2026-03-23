import { parseLogsToSteps } from "../utils/traceParser";
import { createTrace, createTraceSteps } from "./trace.service";
import { createLogs } from "./log.service";
import { createMetrics } from "./metrics.service";

interface IngestTraceInput {
  userId: string;
  traceName?: string;
  logs: any[];
}

export async function ingestTrace({
  userId,
  traceName,
  logs,
}: IngestTraceInput) {
  // 1. Create Trace
  const trace = await createTrace(userId, traceName);

  // 2. Store Raw Logs
  await createLogs(userId, trace.id, logs);

  // 3. Parse Logs → Steps
  const steps = parseLogsToSteps(logs);

  // 4. Store Steps
  await createTraceSteps(trace.id, steps);

  // 5. Create Metrics
  await createMetrics(trace.id, steps);

  return trace;

  // Remember to add the transactional logic later
}
