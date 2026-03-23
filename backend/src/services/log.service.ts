import { prisma } from "../lib/prisma";

export async function createLogs(userId: string, traceId: string, logs: any[]) {
  if (!logs.length) return;

  await prisma.log.createMany({
    data: logs.map((log) => ({
      userId,
      traceId,
      source: log.source ?? "ingest",
      level: log.level ?? "INFO",
      message: log.message ?? JSON.stringify(log),
      metadata: log.metadata ?? log,
    })),
  });
}
