import styles from "./TimelineEvent.module.css";
import type { TimelineEvent as TEvent } from "@/types/timeline";
import JsonBlock from "./JsonBlock";

type Props = {
  event: TEvent;
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ✅ User-friendly kind labels
function kindLabel(kind: "LOG" | "STEP") {
  return kind === "LOG" ? "System" : "Execution";
}

// ✅ Optional: nicer icons
function eventIcon(kind: "LOG" | "STEP") {
  return kind === "LOG" ? "🧾" : "🧩";
}

function pillClass(kind: "LOG" | "STEP") {
  return kind === "LOG" ? styles.pillLog : styles.pillStep;
}

// ✅ User-friendly StepType labels
function stepTypeLabel(stepType?: string) {
  switch (stepType) {
    case "PROMPT":
      return "Prompt Sent";
    case "LLM_CALL":
      return "Model Call";
    case "TOOL_CALL":
      return "Tool Used";
    case "RETRIEVAL":
      return "Retrieval";
    case "FUNCTION_CALL":
      return "Function Call";
    case "ERROR":
      return "Failure";
    default:
      return stepType ?? "Step";
  }
}

// ✅ Keep coloring rules: ERROR red, WARN yellow, else info
function severityClass(value?: string) {
  if (!value) return styles.pillInfo;
  if (value === "ERROR") return styles.pillError;
  if (value === "WARN") return styles.pillWarn;
  return styles.pillInfo;
}

// Optional: nicer LOG level text (INFO/WARN/ERROR → Info/Warning/Error)
function levelLabel(level?: string) {
  if (!level) return "Info";
  if (level === "WARN") return "Warning";
  if (level === "ERROR") return "Error";
  return "Info";
}

export default function TimelineEvent({ event }: Props) {
  const at = timeLabel(event.at);

  // -------------------------
  // LOGS (System)
  // -------------------------
  if (event.kind === "LOG") {
    const log = event.data;

    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.left}>
            <span className={`${styles.pill} ${pillClass("LOG")}`}>
              {eventIcon("LOG")} {kindLabel("LOG")}
            </span>

            <span className={`${styles.pill} ${severityClass(log.level)}`}>
              {levelLabel(log.level)}
            </span>

            {log.source ? (
              <span className={styles.muted}>source: {log.source}</span>
            ) : null}
          </div>

          <div className={styles.time}>{at}</div>
        </div>

        {/* If you also want the LOG message displayed, uncomment this:
        {log.message ? (
          <>
            <div className={styles.label}>Message</div>
            <div className={styles.body}>{log.message}</div>
          </>
        ) : null}
        */}

        {log.metadata ? (
          <JsonBlock title="Metadata" value={log.metadata} />
        ) : null}
      </div>
    );
  }

  // -------------------------
  // STEPS (Execution)
  // -------------------------
  const step = event.data;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.left}>
          {/* Execution badge */}
          <span className={`${styles.pill} ${pillClass("STEP")}`}>
            {eventIcon("STEP")} {kindLabel("STEP")}
          </span>

          {/* StepType badge (with nicer label + same severity color) */}
          <span className={`${styles.pill} ${severityClass(step.stepType)}`}>
            {stepTypeLabel(step.stepType)}
          </span>

          <span className={styles.muted}>#{step.stepIndex}</span>

          {step.latencyMs !== null ? (
            <span className={styles.metric}>{step.latencyMs}ms</span>
          ) : null}

          {step.tokenUsage !== null ? (
            <span className={styles.metric}>{step.tokenUsage} tokens</span>
          ) : null}
        </div>

        <div className={styles.time}>{at}</div>
      </div>

      {step.prompt ? (
        <>
          <div className={styles.label}>Prompt</div>
          <div className={styles.body}>{step.prompt}</div>
        </>
      ) : null}

      {step.response ? (
        <>
          <div className={styles.label}>Response</div>
          <div className={styles.body}>{step.response}</div>
        </>
      ) : null}

      {step.toolName ? (
        <>
          <div className={styles.label}>Tool</div>
          <div className={styles.body}>{step.toolName}</div>
        </>
      ) : null}

      {step.toolInput ? (
        <JsonBlock title="Tool Input" value={step.toolInput} />
      ) : null}
      {step.toolOutput ? (
        <JsonBlock title="Tool Output" value={step.toolOutput} />
      ) : null}
      {step.retrievedDocs ? (
        <JsonBlock title="Retrieved Docs" value={step.retrievedDocs} />
      ) : null}

      {step.errorMessage ? (
        <div className={styles.errorBox}>{step.errorMessage}</div>
      ) : null}
    </div>
  );
}
