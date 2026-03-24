export type TraceStatus = "SUCCESS" | "FAILED";
export type StepType =
  | "PROMPT"
  | "LLM_CALL"
  | "TOOL_CALL"
  | "RETRIEVAL"
  | "EMBEDDING"
  | "FUNCTION_CALL"
  | "ERROR";

export type LogLevel = "INFO" | "WARNING" | "ERROR";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type TraceStep = {
  id: string;
  traceId: string;
  stepIndex: number;
  stepType: StepType;

  prompt: string | null;
  response: string | null;

  toolName: string | null;
  toolInput: JsonValue | null;
  toolOutput: JsonValue | null;

  retrievedDocs: JsonValue | null;

  latencyMs: number | null;
  tokenUsage: number | null;

  errorMessage: string | null;

  createdAt: string;
};

export type Log = {
  id: string;
  userId: string;
  traceId: string;

  source: string;

  level: LogLevel;
  message: string;
  metadata: JsonValue | null;

  createdAt: string;
};

export type Metric = {
  id: string;
  traceId: string;
  totalLatency: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
  createdAt: string;
};

export type TimelineEvent =
  | {
      kind: "STEP";
      at: string;
      data: TraceStep;
    }
  | {
      kind: "LOG";
      at: string;
      data: Log;
    };

export type TraceTimelineResponse = {
  trace: {
    id: string;
    name: string | null;
    createdAt: string;
  };
  events: TimelineEvent[];
  metrics: Metric | null;
};
