import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createTrace(userId: string, name?: string) {
  return prisma.trace.create({
    data: { userId, name },
  });
}

export async function createTraceSteps(traceId: string, steps: any[]) {
  return prisma.traceStep.createMany({
    data: steps.map((step) => ({
      ...step,
      traceId,
    })),
  });
}

export async function listTraces(userId: string) {
  return prisma.trace.findMany({
    where: { userId, deletedAt: null }, // ✅ user-scoped
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      metrics: {
        select: {
          totalLatency: true,
          totalTokens: true,
          estimatedCost: true,
        },
      },
    },
  });
}

export async function softDeleteTrace(traceId: string, userId: string) {
  return prisma.trace.updateMany({
    where: { id: traceId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}
