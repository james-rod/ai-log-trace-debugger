"use client";

import type { TraceListItem } from "@/types/trace";
import styles from "./TraceRow.module.css";

type Props = {
  trace: TraceListItem;
  onDelete?: (traceId: string) => void;
};

function formatMoney(amount: number) {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}

export default function TraceRow({ trace, onDelete }: Props) {
  const name = trace.name?.trim() || "Untitled Trace";

  const latency = trace.metrics?.totalLatency ?? null;
  const tokens = trace.metrics?.totalTokens ?? null;
  const cost = trace.metrics?.estimatedCost ?? null;

  const createdLabel = new Date(trace.createdAt).toLocaleString();

  const statusClass =
    trace.status === "SUCCESS" ? styles.statusSuccess : styles.statusFailed;

  async function copyId(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(trace.id);
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(trace.id);
  }

  return (
    <div className={styles.row} role="button" tabIndex={0}>
      <div className={styles.top}>
        <span className={statusClass}>{trace.status}</span>
        <span className={styles.time}>{createdLabel}</span>
      </div>

      <div className={styles.name}>{name}</div>

      <div className={styles.meta}>
        <span>{latency !== null ? `${latency} ms` : "— ms"}</span>
        <span>{tokens !== null ? `${tokens} tokens` : "— tokens"}</span>
        <span>{cost !== null ? formatMoney(cost) : "—"}</span>
        <span className={styles.id}>{trace.id.slice(0, 8)}…</span>

        <div className={styles.action}>
          <button type="button" className={styles.actionBtn} onClick={copyId}>
            Copy ID
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.dangerBtn}`}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
