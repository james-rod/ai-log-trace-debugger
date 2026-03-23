"use client";

import { useMemo, useState } from "react";
import styles from "./JsonBlock.module.css";

type Props = {
  title?: string;
  value: unknown;
  defaultCollapsed?: boolean;
  maxChars?: number;
};

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

export default function JsonBlock({
  title,
  value,
  defaultCollapsed = true,
  maxChars = 400,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expanded, setExpanded] = useState(false);

  const text = useMemo(() => safeStringify(value), [value]);
  const isLong = text.length > maxChars;
  const shown = !expanded && isLong ? text.slice(0, maxChars) + "\n…" : text;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        {title ? <div className={styles.title}>{title}</div> : <div />}
        <div className={styles.actions}>
          <button
            className={styles.btn}
            type="button"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>

          {!collapsed && !isLong ? (
            <button
              type="button"
              className={styles.btn}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          ) : null}
        </div>
      </div>

      {!collapsed ? <pre className={styles.pre}>{shown}</pre> : null}
    </div>
  );
}
