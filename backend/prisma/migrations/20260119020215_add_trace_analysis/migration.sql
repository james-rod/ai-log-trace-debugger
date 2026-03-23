-- CreateTable
CREATE TABLE "TraceAnalysis" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "diagnosis" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "promptVer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraceAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TraceAnalysis_traceId_key" ON "TraceAnalysis"("traceId");

-- AddForeignKey
ALTER TABLE "TraceAnalysis" ADD CONSTRAINT "TraceAnalysis_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
