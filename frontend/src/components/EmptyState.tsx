import styles from "./EmptyState.module.css";

type Variant = "info" | "error";

type Props = {
  title: string;
  subtitle?: string;
  variant?: Variant;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
};
// Works for empty list + error state with optional action button.
export default function EmptyState({
  title,
  subtitle,
  variant = "info",
  hint,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div
      className={`${styles.container} ${variant === "error" ? styles.error : styles.info}`}
    >
      <div className={styles.title}>{title}</div>
      {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      {hint ? <div className={styles.hint}>{hint}</div> : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
