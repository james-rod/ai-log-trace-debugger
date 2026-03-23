import { StepType } from "@prisma/client";

export function parseLogsToSteps(rawLogs: any[]) {
  return rawLogs.map((log, index) => {
    // Support both shapes:
    // A) { type, content, latency, tokenUsage }
    // B) { level, message, metadata: { latencyMs, tokens } }

    const level = (log.level ?? "").toString().toUpperCase(); // INFO/WARN/ERROR
    const message = (log.message ?? "").toString();
    const type = log.type ?? inferTypeFromMessage(message, level);

    const content = log.content ?? message ?? "";

    // Default to FUNCTION_CALL for generic system logs (not LLM)
    let stepType: StepType = StepType.FUNCTION_CALL;

    if (type === "prompt") stepType = StepType.PROMPT;
    if (type === "llm") stepType = StepType.LLM_CALL;
    if (type === "error") stepType = StepType.ERROR;
    if (type === "tool") stepType = StepType.TOOL_CALL;
    if (type === "retrieval") stepType = StepType.RETRIEVAL;

    const latencyMs =
      log.latency ?? log.latencyMs ?? log.metadata?.latencyMs ?? null;

    // If it's not an LLM call, tokens usually don't apply → default to 0 (optional)
    const tokenUsageRaw =
      log.tokenUsage ?? log.tokens ?? log.metadata?.tokens ?? null;

    const tokenUsage =
      stepType === StepType.LLM_CALL ? tokenUsageRaw : (tokenUsageRaw ?? 0);

    return {
      stepIndex: index,
      stepType,

      // Keep prompt/response as nullable strings for now
      prompt: stepType === StepType.PROMPT ? content : null,
      response: stepType === StepType.LLM_CALL ? content : null,

      latencyMs,
      tokenUsage,

      errorMessage: stepType === StepType.ERROR ? content : null,
    };
  });
}

/**
 * Better heuristic for non-LLM traces.
 * If message looks like HTTP/route/db/etc, classify accordingly.
 */
function inferTypeFromMessage(message?: string, level?: string) {
  const msg = (message ?? "").toLowerCase();
  const lvl = (level ?? "").toUpperCase();

  // Hard errors first
  if (
    lvl === "ERROR" ||
    msg.includes("error") ||
    msg.includes("exception") ||
    msg.includes("failed") ||
    msg.includes("abort") ||
    msg.includes("stack")
  ) {
    return "error";
  }

  // Explicit prompt/LLM markers
  if (msg.includes("prompt")) return "prompt";
  if (
    msg.includes("llm") ||
    msg.includes("model") ||
    msg.includes("completion") ||
    msg.includes("responded")
  ) {
    return "llm";
  }

  // Tool-ish markers (explicit)
  if (
    msg.includes("tool call") ||
    msg.includes("tool:") ||
    msg.includes("function call")
  ) {
    return "tool";
  }

  // Retrieval markers
  if (
    msg.includes("retrieve") ||
    msg.includes("retrieval") ||
    msg.includes("vector")
  ) {
    return "retrieval";
  }

  // HTTP / routing markers → treat as function call
  if (
    msg.includes("incoming get") ||
    msg.includes("incoming post") ||
    msg.includes("get /") ||
    msg.includes("post /") ||
    msg.includes("put /") ||
    msg.includes("delete /") ||
    msg.includes("/api/") ||
    msg.includes("route") ||
    msg.includes("endpoint") ||
    msg.includes("status code") ||
    /\b(404|401|403|500|502|503|504)\b/.test(msg)
  ) {
    return "function";
  }

  // DB-ish markers → treat as tool call
  if (
    msg.includes("sql") ||
    msg.includes("select ") ||
    msg.includes("insert ") ||
    msg.includes("update ") ||
    msg.includes("delete from") ||
    msg.includes("commit") ||
    msg.includes("rollback") ||
    msg.includes("db ") ||
    msg.includes("database")
  ) {
    return "tool";
  }

  // Default: generic system step (function)
  return "function";
}
