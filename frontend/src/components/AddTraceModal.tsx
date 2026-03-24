"use client";

import { useMemo, useState } from "react";
import styles from "./AddTraceModal.module.css";
import { apiPost } from "@/lib/api";
import { useToast } from "./ToastHost";
import Tooltip from "./Tooltip";

/**
 * ✅ UI wording uses "Steps"
 * ✅ Backend payload still sends: { traceName, logs: [...] }
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

type LogDraft = {
  level: LogLevel;
  message: string;
  latencyMs?: number;
  tokens?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
};

type Template = {
  id: string;
  name: string;
  traceName: string;
  logs: LogDraft[];
};

const TEMPLATES: Template[] = [
  {
    id: "success",
    name: "✅ Success baseline",
    traceName: "Success Baseline",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM",
        latencyMs: 120,
        tokens: 50,
      },
      {
        level: "INFO",
        message: "LLM responded",
        latencyMs: 300,
        tokens: 200,
      },
    ],
  },
  {
    id: "slow_llm",
    name: "🐢 High LLM latency",
    traceName: "High LLM Processing Latency",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM",
        latencyMs: 100,
        tokens: 40,
      },
      {
        level: "INFO",
        message: "LLM responded",
        latencyMs: 950,
        tokens: 300,
      },
    ],
  },
  {
    id: "token_bloat",
    name: "💸 Token explosion",
    traceName: "Excessive Token Usage",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM (large context)",
        latencyMs: 180,
        tokens: 2200,
      },
      {
        level: "INFO",
        message: "LLM responded",
        latencyMs: 420,
        tokens: 1800,
      },
    ],
  },
  {
    id: "error_call",
    name: "❌ LLM failed",
    traceName: "LLM Request Failed",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM",
        latencyMs: 90,
        tokens: 45,
      },
      {
        level: "ERROR",
        message: "LLM API returned 500 error",
        latencyMs: 200,
        tokens: 0,
      },
    ],
  },
  {
    id: "retry",
    name: "🔁 Retry then success",
    traceName: "LLM Retry After Failure",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM",
        latencyMs: 110,
        tokens: 55,
      },
      {
        level: "ERROR",
        message: "LLM timeout",
        latencyMs: 800,
        tokens: 0,
      },
      {
        level: "INFO",
        message: "Retrying LLM request",
        latencyMs: 50,
        tokens: 0,
      },
      {
        level: "INFO",
        message: "LLM responded",
        latencyMs: 420,
        tokens: 220,
      },
    ],
  },
  {
    id: "tool",
    name: "🧰 Tool call involved",
    traceName: "Tool Call During Generation",
    logs: [
      {
        level: "INFO",
        message: "Prompt sent to LLM",
        latencyMs: 100,
        tokens: 60,
      },
      {
        level: "INFO",
        message: "Tool call: fetchUserProfile",
        latencyMs: 250,
        tokens: 0,
      },
      {
        level: "INFO",
        message: "LLM responded",
        latencyMs: 380,
        tokens: 180,
      },
    ],
  },
];

export default function AddTraceModal({ open, onClose, onCreated }: Props) {
  const toast = useToast();

  const [traceName, setTraceName] = useState("");
  const [logs, setLogs] = useState<LogDraft[]>([
    { level: "INFO", message: "", latencyMs: 120, tokens: 50 },
    { level: "INFO", message: "", latencyMs: 300, tokens: 200 },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("success");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!traceName.trim()) return false;
    if (!logs.length) return false;
    return logs.every((log) => log.message.trim().length > 0);
  }, [traceName, logs]);

  function applyTemplate(templateId: string) {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setSelectedTemplateId(templateId);
    setTraceName(t.traceName);
    setLogs(t.logs.map((l) => ({ ...l })));
  }

  function updateLog(i: number, patch: Partial<LogDraft>) {
    setLogs((prev) =>
      prev.map((log, idx) => (idx === i ? { ...log, ...patch } : log)),
    );
  }

  function addLog() {
    setLogs((prev) => [...prev, { level: "INFO", message: "" }]);
  }

  function removeLog(i: number) {
    setLogs((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiPost("/traces/ingest", {
        traceName: traceName.trim(),
        logs: logs.map((l) => ({
          level: l.level,
          message: l.message,
          source: "ui",
          metadata: {
            latencyMs: l.latencyMs ?? null,
            tokens: l.tokens ?? null,
          },
        })),
      });

      toast.success("✅ Trace created successfully!");
      onClose();
      setTraceName("");
      setLogs([{ level: "INFO", message: "" }]);
      await onCreated();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "❌ Failed to create trace";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.head}>
          <div>
            <div className={styles.title}>Add Trace</div>
            <div className={styles.sub}>Create a trace without Postman</div>
          </div>

          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Templates */}
        <div className={styles.presets}>
          <div className={styles.label}>Templates</div>

          <div className={styles.presetRow}>
            <select
              className="input"
              value={selectedTemplateId}
              onChange={(e) => applyTemplate(e.target.value)}
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              className="btn"
              type="button"
              onClick={() => applyTemplate(selectedTemplateId)}
            >
              Apply
            </button>
          </div>

          <div className={styles.presetGrid}>
            {TEMPLATES.slice(0, 4).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.presetChip} ${
                  t.id === selectedTemplateId ? styles.presetChipActive : ""
                }`}
                onClick={() => applyTemplate(t.id)}
                title="Fill form with this template"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Trace name</label>
            <input
              type="text"
              className="input"
              value={traceName}
              onChange={(e) => setTraceName(e.target.value)}
              placeholder="e.g. React state not updating"
            />
          </div>

          {/* Steps header + micro instructions */}
          <div className={styles.logsHead}>
            <div>
              <div className={styles.label}>Steps</div>
              <div className={styles.helperText}>
                Steps represent the sequence of actions that happened during
                this execution. Add them in the order they occurred.
              </div>
            </div>

            <button className="btn" type="button" onClick={addLog}>
              + Add step
            </button>
          </div>

          {/* Column guidance */}
          <div className={styles.columnsHelp}>
            <div className={styles.columnLabel}>Severity</div>

            <div className={styles.columnLabel}>Step description</div>

            <div className={styles.columnLabel}>
              Latency (ms)
              <Tooltip text="Time taken for this step to complete." />
              <div className={styles.inlineHint}>
                Example: 120 = 120 milliseconds (0.12 seconds)
              </div>
            </div>

            <div className={styles.columnLabel}>
              Tokens
              <Tooltip text="Number of tokens processed by the LLM during this step." />
              <div className={styles.inlineHint}>
                Only required for LLM-related steps
              </div>
            </div>

            <div />
          </div>

          <div className={styles.logs}>
            {logs.map((log, i) => (
              <div key={i} className={styles.logsRow}>
                <select
                  className="input"
                  value={log.level}
                  onChange={(e) =>
                    updateLog(i, { level: e.target.value as LogLevel })
                  }
                  title="Step severity"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>

                <input
                  className="input"
                  value={log.message}
                  onChange={(e) => updateLog(i, { message: e.target.value })}
                  placeholder="What happened in this step?"
                />

                <input
                  className="input"
                  value={log.latencyMs ?? ""}
                  onChange={(e) =>
                    updateLog(i, { latencyMs: Number(e.target.value || 0) })
                  }
                  placeholder="Execution ms"
                  title="Execution time (ms)"
                />

                <input
                  className="input"
                  value={log.tokens ?? ""}
                  onChange={(e) =>
                    updateLog(i, { tokens: Number(e.target.value || 0) })
                  }
                  placeholder="Tokens"
                  title="Token usage (LLM only)"
                />

                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => removeLog(i)}
                  aria-label="Remove step"
                  title="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primary}
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Creating…" : "Create trace"}
          </button>
        </div>
      </div>
    </div>
  );
}
