"use client";

import { useEffect, useState } from "react";
import styles from "./AnalysisPanel.module.css";
import { apiPost } from "@/lib/api";
import type { Diagnosis, AnalysisResponse } from "@/types/diagnosis";
import Tooltip from "./Tooltip";

type Props = {
  traceId: string;
  onEvidenceClick?: (index: number) => void;
};

function formatTs(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function formatAge(seconds?: number) {
  if (seconds == null) return "";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s ago`;
}

export default function AnalysisPanel({ traceId, onEvidenceClick }: Props) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [meta, setMeta] = useState<{
    cached: boolean;
    model: string;
    updatedAt: string;
    cacheAgeSeconds?: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`diag:${traceId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AnalysisResponse;

        setDiagnosis(parsed.diagnosis);

        setMeta({
          cached: parsed.cached,
          model: parsed.model,
          updatedAt: parsed.updatedAt,
          cacheAgeSeconds: parsed.cacheAgeSeconds,
        });
      } catch {
        // ignore
      }
    } else {
      setDiagnosis(null);
      setMeta(null);
    }
  }, [traceId]);

  async function analyze(force: boolean) {
    setLoading(true);
    setError(null);

    try {
      const url = force ? "/ai/analyze?reanalyze=true" : "/ai/analyze";
      const res = await apiPost<AnalysisResponse>(url, { traceId });

      setDiagnosis(res.diagnosis);
      setMeta({
        cached: res.cached,
        model: res.model,
        updatedAt: res.updatedAt,
        cacheAgeSeconds: res.cacheAgeSeconds,
      });

      sessionStorage.setItem(`diag:${traceId}`, JSON.stringify(res));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to analyze trace");
      setDiagnosis(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!diagnosis) return;

    const lines: string[] = [];
    lines.push(`Trace: ${traceId}`);
    if (meta) {
      lines.push(`Model: ${meta.model}`);
      lines.push(`Last run: ${formatTs(meta.updatedAt)}`);
      lines.push(`Cached: ${meta.cached ? "yes" : "no"}`);
      if (meta.cached && meta.cacheAgeSeconds != null) {
        lines.push(`Cache age: ${formatAge(meta.cacheAgeSeconds)}`);
      }
    }

    lines.push("");
    lines.push(`Confidence: ${diagnosis.confidence}`);
    lines.push("");
    lines.push(`Summary:`);
    lines.push(diagnosis.summary);
    lines.push("");

    lines.push(`Findings:`);
    diagnosis.rootCauses.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.title}`);
      lines.push(`   Why: ${r.why}`);
      lines.push(`   Evidence: ${r.evidenceEventIndices.join(", ")}`);
    });

    lines.push("");
    lines.push(`Recommended actions:`);
    diagnosis.fixes.forEach((f) => lines.push(`- ${f}`));

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const hasDiagnosis = Boolean(diagnosis);

  const isOptimizationsOnly =
    diagnosis &&
    (diagnosis.confidence === "HIGH" || diagnosis.confidence === "MED");

  const findingsTitle = isOptimizationsOnly
    ? "Optimization Opportunities"
    : "Root Causes";

  const emptyFindingsCopy = isOptimizationsOnly
    ? "No optimization opportunities detected."
    : "No root causes detected.";

  return (
    <aside className={styles.card}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>AI Diagnosis</div>
          <div className={styles.muted}>
            Diagnosis + Recommended Actions ({meta?.model ?? "gpt-4o-mini"})
          </div>

          {meta ? (
            <div className={styles.muted}>
              {meta.cached ? (
                <span className={styles.inlineMeta}>
                  <span className={styles.cachedBadge}>Cached</span>
                  <Tooltip text="This diagnosis was returned from saved analysis instead of running a new live model call." />
                </span>
              ) : (
                <span className={styles.liveBadge}>Live</span>
              )}
              <span className={styles.dot}>•</span>
              Last run: {formatTs(meta.updatedAt)}
              {meta.cached && meta.cacheAgeSeconds != null ? (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={styles.inlineMeta}>
                    Cache age: {formatAge(meta.cacheAgeSeconds)}
                    <Tooltip text="How long ago this cached diagnosis was generated." />
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => analyze(false)}
            disabled={loading}
            title="Run analysis (uses cache if available)"
          >
            {loading ? "Analyzing…" : "Run analysis"}
          </button>

          <button
            type="button"
            className={styles.copyBtn}
            onClick={() => analyze(true)}
            disabled={loading || !hasDiagnosis}
            title="Force a new live model call"
          >
            Refresh live
          </button>

          <button
            type="button"
            className={styles.copyBtn}
            onClick={copyReport}
            disabled={!diagnosis}
            title="Copy diagnosis as text"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      {!diagnosis ? (
        <div className={styles.empty}>
          Click <b>Run analysis</b> to generate a diagnosis for this trace.
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryTop}>
              <span className={styles.badge}>
                Confidence
                <Tooltip text="How certain the AI is about its diagnosis." />
              </span>

              <span
                className={`${styles.conf} ${styles[`conf_${diagnosis.confidence}`]}`}
              >
                {diagnosis.confidence}
              </span>
            </div>

            <div className={styles.text}>{diagnosis.summary}</div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>{findingsTitle}</div>

            {diagnosis.rootCauses.length === 0 ? (
              <div className={styles.muted}>{emptyFindingsCopy}</div>
            ) : (
              <div className={styles.stack}>
                {diagnosis.rootCauses.map((rc, idx) => (
                  <div key={idx} className={styles.item}>
                    <div className={styles.itemTitle}>{rc.title}</div>

                    <div className={styles.why}>
                      <b>Why:</b> {rc.why}
                    </div>

                    {rc.evidenceEventIndices.length > 0 && (
                      <div className={styles.evidenceRow}>
                        <span className={styles.evidenceLabel}>Evidence:</span>

                        <div className={styles.evidenceChips}>
                          {rc.evidenceEventIndices.map((i) => (
                            <button
                              key={i}
                              type="button"
                              className={styles.evidenceChip}
                              onClick={() => onEvidenceClick?.(i)}
                              disabled={!onEvidenceClick}
                              title={`Jump to step #${i}`}
                            >
                              Step #{i}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Recommended actions
              <Tooltip text="Suggested next steps based on the diagnosis and supporting evidence." />
            </div>

            <ul className={styles.list}>
              {diagnosis.fixes.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}
