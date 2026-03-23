"use client";

import { useState } from "react";
import styles from "./CopyButton.module.css";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <button type="button" className={styles.btn} onClick={copy}>
      {copied ? "Copied" : "Copy ID"}
    </button>
  );
}
