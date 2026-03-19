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

      {byProject.map(([projectName, items]) => (
        <section key={projectName} className="surface-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold">{projectName}</h2>
          <div className="text-xs text-muted mt-1">{items.length} video(s) pending</div>

          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="surface-muted rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted mt-1">Status: {item.status}</div>
                </div>
                <Link href={`/dashboard/review-queue/${item.id}`} className="button-primary rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap">
                  Review Video
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
