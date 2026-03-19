"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type QueueItem = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  status: string;
};

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluator/review-queue`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load queue");
        setQueue(payload.queue || []);
      } catch (e: any) {
        setError(e.message || "Failed to load queue");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const byProject = useMemo(() => {
    const grouped = new Map<string, QueueItem[]>();
    queue.forEach((item) => {
      const existing = grouped.get(item.projectName) || [];
      existing.push(item);
      grouped.set(item.projectName, existing);
    });
    return [...grouped.entries()];
  }, [queue]);

  const reviewedCount = useMemo(
    () => queue.filter((item) => item.status === "reviewed").length,
    [queue]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Review Queue</h1>
        <p className="text-sm text-muted mt-2">Pending videos assigned to you, grouped by project.</p>
      </section>

      {loading ? <div className="surface-card rounded-2xl p-6">Loading...</div> : null}
      {error ? <div className="surface-card rounded-2xl p-6 text-rose-600">{error}</div> : null}

      {!loading && !error && queue.length === 0 ? (
        <div className="surface-card rounded-2xl p-6 text-muted">No pending videos in your queue.</div>
      ) : null}

      {!loading && !error && queue.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <Metric title="Queue Items" value={queue.length} />
          <Metric title="Active Projects" value={byProject.length} />
          <Metric title="Pending" value={queue.length - reviewedCount} />
          <Metric title="Reviewed" value={reviewedCount} />
        </section>
      ) : null}

      {byProject.map(([projectName, items]) => (
        <section key={projectName} className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{projectName}</h2>
          <div className="text-xs text-muted mt-1">{items.length} video(s) pending</div>

          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="surface-muted rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium capitalize">
                    {item.status}
                  </span>
                  <Link
                    href={`/dashboard/review-queue/${item.id}`}
                    className="button-primary inline-flex rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  >
                  Review Video
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <div className="text-[15px] text-slate-600">{title}</div>
      <div className="text-5xl leading-none font-semibold mt-2">{value}</div>
    </div>
  );
}
