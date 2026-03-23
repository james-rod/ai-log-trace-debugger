import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>AI Log &amp; Trace Debugger</div>
          <div className={styles.subtitle}>
            Monitor, inspect, and debug AI execution flows.
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} href="/login">
              Get Started
            </Link>

            <a
              className={styles.secondaryBtn}
              href="http://127.0.0.1:4000/health"
              target="_blank"
            >
              Backend Health
            </a>
          </div>
        </div>
      </header>

      {/* Optional: keep these sections if you plan to add feature cards later */}
      <section className={styles.cards}>{/* Cards Go Here */}</section>
      <section className={styles.main}>{/* List + details */}</section>
    </main>
  );
}
