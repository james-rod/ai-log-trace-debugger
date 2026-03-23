"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

import { apiGet, apiDelete } from "@/lib/api";
import type { TraceListItem } from "@/types/trace";

import TraceRow from "@/components/TraceRow";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

import AuthGate from "@/components/AuthGate";

import AddTraceModal from "@/components/AddTraceModal";
import { useToast } from "@/components/ToastHost"; // optional if you want extra toasts

import styles from "./page.module.css";

type StatusFilter = "ALL" | "SUCCESS" | "FAILED";

type SortKey = "NEWEST" | "LATENCY" | "TOKENS" | "COST";

export default function TracePage() {
  const [loading, setLoading] = useState(true);
  const [traces, setTraces] = useState<TraceListItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("NEWEST");

  const [openAdd, setOpenAdd] = useState(false);

  async function loadTraces() {
    try {
      setError(null);
      const data = await apiGet<TraceListItem[]>("/traces");
      setTraces(data);
    } catch (error: any) {
      setError(error?.message ?? "Failed to Load Traces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTraces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => loadTraces(), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const filtered = useMemo(() => {
    // filter traces based on query and status
    const q = query.toLowerCase();

    return traces.filter((trace) => {
      if (status !== "ALL" && trace.status !== status) return false; // status filter check
      if (!q) return true; // no query, include all

      const hay = `${trace.name ?? ""} ${trace.id}`.toLowerCase(); // fields to search
      return hay.includes(q);
    });
  }, [traces, query, status]);

  const sorted = useMemo(() => {
    const arr = [...filtered];

    if (sort === "NEWEST") return arr;

    if (sort === "LATENCY") {
      return arr.sort(
        (a, b) =>
          (b.metrics?.totalLatency ?? -1) - (a.metrics?.totalLatency ?? -1),
      );
    }

    if (sort === "TOKENS") {
      return arr.sort(
        (a, b) =>
          (b.metrics?.totalTokens ?? -1) - (a.metrics?.totalTokens ?? -1),
      );
    }

    return arr.sort(
      (a, b) =>
        (b.metrics?.estimatedCost ?? -1) - (a.metrics?.estimatedCost ?? -1),
    );
  }, [filtered, sort]);

  const stats = useMemo(() => {
    // compute trace stats
    const total = traces.length;
    const failed = traces.filter((t) => t.status === "FAILED").length;
    const success = total - failed;

    const avgDuration = (() => {
      const vals = traces
        .map((t) => t.metrics?.totalLatency ?? null)
        .filter((v): v is number => typeof v === "number");
      if (!vals.length) return null;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    })();

    const successRate = total === 0 ? 0 : Math.round((success / total) * 100);

    return { total, failed, successRate, avgDuration };
  }, [traces]);

  async function handleDelete(id: string) {
    const ok = confirm(
      "Soft Delete this Trace? You can't view it after deletion.",
    );
    if (!ok) return;

    try {
      await apiDelete(`/traces/${id}`);
      await loadTraces();
    } catch (error: any) {
      setError(error?.message ?? "Failed To Delete Trace");
    }
  }

  return (
    <AuthGate>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>AI Execution Traces</h1>
            <p className={styles.subtitle}>
              Inspect and debug AI execution flows
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className="btn"
              onClick={() => setAutoRefresh((v) => !v)}
            >
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </button>

            <button type="button" className="btn" onClick={loadTraces}>
              Refresh
            </button>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => setOpenAdd(true)}
          >
            + Add Trace
          </button>
        </header>

        {/* KPI Cards */}
        <section className={styles.kpis}>
          <StatCard label="Total Requests" value={String(stats.total)} />
          <StatCard label="Success Rate" value={`${stats.successRate}%`} />
          <StatCard
            label="Avg Duration"
            value={stats.avgDuration === null ? "—" : `${stats.avgDuration}ms`}
          />
          <StatCard label="Failed Requests" value={String(stats.failed)} />
        </section>

        {/* Controls */}
        <section className={styles.controls}>
          <div>
            <div className={styles.controlLabel}>Search</div>
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Trace by name or ID..."
            />
          </div>

          <div>
            <div className={styles.controlLabel}>Status</div>
            <select
              className={styles.input}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <div className={styles.controlLabel}>Sort</div>
            <select
              className={styles.input}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="NEWEST">Newest</option>
              <option value="LATENCY">Latency (high → low)</option>
              <option value="TOKENS">Tokens (high → low)</option>
              <option value="COST">Cost (high → low)</option>
            </select>
          </div>
        </section>

        {/* Trace List */}

        <section className={`card ${styles.listCard}`}>
          <div className={styles.listHeader}>
            <div>
              <div className={styles.listTitle}>Request Log</div>
              <div className={styles.listSub}>
                Chronological List of AI Requests
              </div>
            </div>

            <div className={styles.countText}>
              Showing <b>{filtered.length}</b> of <b>{traces.length}</b>
            </div>
          </div>

          <div className={styles.spacer12} />

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <EmptyState
              title="Could Not Load Traces"
              subtitle={error}
              actionLabel="Try Again"
              onAction={loadTraces}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No Traces Found"
              subtitle="Try adjusting your search or filter settings."
            />
          ) : (
            <div className={styles.rows}>
              {sorted.map((trace) => (
                <Link
                  key={trace.id}
                  href={`/traces/${trace.id}`}
                  prefetch={false}
                >
                  <TraceRow trace={trace} onDelete={handleDelete} />
                </Link>
              ))}
            </div>
          )}
        </section>
        <AddTraceModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onCreated={loadTraces}
        />
      </main>
    </AuthGate>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`card ${styles.statCard}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
