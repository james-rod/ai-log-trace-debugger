"use client";

import { useId } from "react";
import styles from "./Tooltip.module.css";

type Props = {
  text: string;
};

export default function Tooltip({ text }: Props) {
  const id = useId();
  return (
    <span className={styles.wrapper}>
      <button
        type={"button"}
        className={styles.icon}
        aria-describedby={id}
        aria-label="More Information"
      >
        ⓘ
      </button>
      <span id={id} role="tooltip" className={styles.tooltip}>
        {text}
      </span>
    </span>
  );
}
