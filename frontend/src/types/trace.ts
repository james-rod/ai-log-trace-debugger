export type TraceStatus = "SUCCESS" | "FAILED";

export type TraceMetricsSummary = {
  totalLatency: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
};

export type TraceListItem = {
  id: string;
  name: string | null;
  status: TraceStatus;
  createdAt: string;
  metrics: TraceMetricsSummary | null;
};
