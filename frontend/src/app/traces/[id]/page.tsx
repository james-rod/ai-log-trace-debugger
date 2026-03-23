"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import styles from "./page.module.css";

import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import MetricsPills from "@/components/MetricsPills";
import TimelineEvent from "@/components/TimelineEvent";
import CopyButton from "@/components/CopyButton";
import TimelineToolbar from "@/components/TimelineToolbar";
import AnalysisPanel from "@/components/AnalysisPanel";

import AuthGate from "@/components/AuthGate";

import { apiGet } from "@/lib/api";
import type { TraceTimelineResponse } from "@/types/timeline";

type FilterKind = "ALL" | "LOG" | "STEP";

export default function TraceTimelinePage() {
  const params = useParams<{ id: string }>();
  const traceId = params.id;

  const [data, setData] = useState<TraceTimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [kind, setKind] = useState<FilterKind>("ALL");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [query, setQuery] = useState("");

  // Evidence highlight
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGet<TraceTimelineResponse>(`/timelines/${traceId}`);
      setData(res);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to load timeline");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!traceId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceId]);

  const title = data?.trace.name?.trim() || "Untitled Trace";

  const createdAt = data?.trace.createdAt
    ? new Date(data.trace.createdAt).toLocaleString()
    : "";

  // Preserve original index for evidence click-to-scroll
  const filteredEvents = useMemo(() => {
    if (!data) return [];

    const q = query.trim().toLowerCase();

    return data.events
      .map((ev, originalIndex) => ({ ev, originalIndex }))
      .filter(({ ev }) => {
        // Kind filter
        if (kind !== "ALL" && ev.kind !== kind) return false;

        // Error detection
        const isError =
          (ev.kind === "LOG" && (ev.data as any).level === "ERROR") ||
          (ev.kind === "STEP" &&
            ((ev.data as any).stepType === "ERROR" ||
              Boolean((ev.data as any).errorMessage)));

        if (errorsOnly && !isError) return false;

        // Search filter
        if (!q) return true;

        try {
          const hay = JSON.stringify(ev.data).toLowerCase();
          return hay.includes(q);
        } catch {
          return false;
        }
      });
  }, [data, kind, errorsOnly, query]);

  function scrollToEvidence(originalIndex: number) {
    // Make sure the event will be visible
    setKind("ALL");
    setErrorsOnly(false);
    setQuery("");

    // Highlight it
    setHighlightIndex(originalIndex);

    // Scroll after render
    requestAnimationFrame(() => {
      const el = document.getElementById(`event-${originalIndex}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // Remove highlight after a moment
    setTimeout(() => setHighlightIndex(null), 1600);
  }

  async function exportJson() {
    const res = await apiGet(`/timelines/${traceId}`);
    const blob = new Blob([JSON.stringify(res, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trace-${traceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasEvents = filteredEvents.length > 0;

  return (
    <AuthGate>
      <main className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumb}>
              <Link href="/traces" className={styles.backLink}>
                ← Back to Traces
              </Link>
            </div>

            <h1 className={styles.h1}>{title}</h1>

            <div className={styles.sub}>
              <span className={styles.muted}>Trace ID:</span>{" "}
              <span className={styles.mono}>{traceId}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.muted}>Created:</span> {createdAt}
            </div>
          </div>

          {/* Right actions */}
          <div className={styles.headerRight}>
            <button className={styles.btn} type="button" onClick={load}>
              Refresh
            </button>
            <CopyButton text={traceId} />

            <button
              className={styles.btn}
              type="button"
              onClick={() => exportJson()}
            >
              Export JSON
            </button>
          </div>
        </header>

        {/* METRICS */}
        <section className={styles.metrics}>
          <MetricsPills metrics={data?.metrics ?? null} />
        </section>

        {/* Main grid: Timeline + Analysis */}
        <div className={styles.grid}>
          {/* Timeline Column */}
          <section className={styles.timelineCard}>
            <div className={styles.timelineHead}>
              <div>
                <div className={styles.sectionTitle}>Execution Flow</div>
                <div className={styles.sectionSub}>
                  Step-by-step breakdown of what happened during this trace
                </div>
              </div>

              <div className={styles.count}>
                {data ? (
                  <>
                    Showing <b>{filteredEvents.length}</b> steps
                  </>
                ) : null}
              </div>
            </div>

            {/* Legend Separator */}

            <div className={styles.legend}>
              <div
                className={styles.legendItem}
                title="System messages and metadata"
              >
                <span className={`${styles.legendDot} ${styles.legendLog}`} />
                System
              </div>

              <div
                className={styles.legendItem}
                title="Execution steps such as prompts, LLM calls, or tool usage"
              >
                <span className={`${styles.legendDot} ${styles.legendStep}`} />
                Step
              </div>

              <div
                className={styles.legendItem}
                title="Failures, exceptions, or rejected operations"
              >
                <span className={`${styles.legendDot} ${styles.legendError}`} />
                Error
              </div>
            </div>

            <div className={styles.sep} />

            {/* Toolbar (Filters + Search) */}
            <TimelineToolbar
              kind={kind}
              setKind={setKind}
              errorsOnly={errorsOnly}
              setErrorsOnly={setErrorsOnly}
              query={query}
              setQuery={setQuery}
            />

            <div className={styles.sep} />

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <EmptyState
                title="Unable to load execution flow"
                subtitle={error}
                actionLabel="Try Again"
                onAction={load}
              />
            ) : !hasEvents ? (
              <EmptyState
                title="No steps match your filters"
                subtitle="Adjust filters or search terms to see more results."
              />
            ) : (
              <div className={styles.events}>
                {filteredEvents.map(({ ev, originalIndex }) => (
                  <div
                    key={`${ev.kind}-${ev.at}-${originalIndex}`}
                    id={`event-${originalIndex}`}
                    className={`${styles.eventWrap} ${
                      highlightIndex === originalIndex
                        ? styles.eventHighlight
                        : ""
                    }`}
                  >
                    <TimelineEvent event={ev} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Analysis Panel (with evidence click) */}
          <AnalysisPanel traceId={traceId} onEvidenceClick={scrollToEvidence} />
        </div>
      </main>
    </AuthGate>
  );
}
