import { prisma } from "../lib/prisma";

export async function getSavedAnalysis(traceId: string) {
  return prisma.traceAnalysis.findUnique({
    where: { traceId },
  });
}
export async function saveAnalysis(args: {
  traceId: string;
  diagnosis: any; // JSON object from LLM
  model: string;
  promptVer?: string;
}) {
  const { traceId, diagnosis, model, promptVer } = args;

  return prisma.traceAnalysis.upsert({
    where: { traceId },
    update: {
      diagnosis,
      model,
      promptVer,
    },
    create: {
      traceId,
      diagnosis,
      model,
      promptVer,
    },
  });
}
