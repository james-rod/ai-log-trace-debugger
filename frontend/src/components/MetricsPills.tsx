import styles from "./MetricsPills.module.css";

type Metrics = null | {
  totalLatency: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
};

function formatMoney(amount: number) {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}

export default function MetricsPills({ metrics }: { metrics: Metrics }) {
  const latency = metrics?.totalLatency ?? null;
  const tokens = metrics?.totalTokens ?? null;
  const cost = metrics?.estimatedCost ?? null;

  return (
    <div className={styles.row}>
      <div className={styles.pill}>
        <span className={styles.label}>Latency</span>
        <span className={styles.value}>
          {" "}
          {latency !== null ? `${latency}ms` : "—"}
        </span>
      </div>

      <div className={styles.pill}>
        <span className={styles.label}>Tokens</span>
        <span className={styles.value}>{tokens !== null ? tokens : "—"}</span>
      </div>

      <div className={styles.pill}>
        <span className={styles.label}>Cost</span>
        <span className={styles.value}>
          {cost !== null ? formatMoney(cost) : "—"}
        </span>
      </div>
    </div>
  );
}
