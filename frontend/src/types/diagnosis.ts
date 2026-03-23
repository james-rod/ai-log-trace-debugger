export type Confidence = "HIGH" | "MED" | "LOW";

export type RootCause = {
  title: string;
  why: string;
  evidenceEventIndices: number[];
};

export type Diagnosis = {
  summary: string;
  confidence: Confidence;
  rootCauses: RootCause[];
  fixes: string[];
};

export type AnalysisResponse = {
  cached: boolean;
  traceId: string;
  model: string;
  diagnosis: Diagnosis;
  updatedAt: string;

  // optional (only present on cached responses)
  cacheAgeSeconds?: number;
  ttlMinutes?: number;
};
