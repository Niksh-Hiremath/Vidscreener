"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <div className="text-zinc-400 mt-1">Pending videos assigned to you.</div>
      </div>

      {loading ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div> : null}
      {error ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error}</div> : null}

      {!loading && !error && queue.length === 0 ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
          No pending videos in your queue.
        </div>
      ) : null}

      {queue.length > 0 ? (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="rounded border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {item.projectName} • {item.status}
                  </div>
                </div>
                <Link
                  href={`/dashboard/review-queue/${item.id}`}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
                >
                  Review Video
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
