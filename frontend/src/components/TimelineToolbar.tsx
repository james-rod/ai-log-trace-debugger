"use client";

import styles from "./TimelineToolbar.module.css";

type FilterKind = "ALL" | "LOG" | "STEP";
type Props = {
  kind: FilterKind;
  setKind: (v: FilterKind) => void;
  errorsOnly: boolean;
  setErrorsOnly: (v: boolean) => void;
  query: string;
  setQuery: (v: string) => void;
};

export default function TimelineToolBar({
  kind,
  setKind,
  errorsOnly,
  setErrorsOnly,
  query,
  setQuery,
}: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <button
          type="button"
          className={`${styles.pill} ${
            kind === "ALL" ? styles.pillActive : ""
          }`}
          onClick={() => setKind("ALL")}
        >
          All
        </button>
        <button
          type="button"
          className={`${styles.pill} ${
            kind === "LOG" ? styles.pillActive : ""
          }`}
          onClick={() => setKind("LOG")}
        >
          Logs
        </button>
        <button
          type="button"
          className={`${styles.pill} ${
            kind === "STEP" ? styles.pillActive : ""
          }`}
          onClick={() => setKind("STEP")}
        >
          Steps
        </button>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={errorsOnly}
            onChange={(e) => setErrorsOnly(e.target.checked)}
          />
          Errors Only
        </label>
      </div>
      <div className={styles.right}>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Prompts, Responses, tools, metadata..."
        />
      </div>
    </div>
  );
}
