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

// Mock flags for visual design demonstration
const MOCK_FLAGS: Record<number, string[]> = {
  1: ["No clear audio", "Multilingual"],
  2: ["Over-polished / Scripted"],
  3: ["Compliance Risk"],
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
        
        // Inject some mock data if queue is totally empty for design preview purposes.
        if (!payload.queue || payload.queue.length === 0) {
           setQueue([
             { id: 1, projectId: 101, projectName: "YCL Admissions 2026", title: "Applicant #4022", status: "pending" },
             { id: 2, projectId: 101, projectName: "YCL Admissions 2026", title: "Applicant #4089", status: "reviewed" },
             { id: 3, projectId: 102, projectName: "Engineering Hiring Q3", title: "Frontend Role - Sarah T.", status: "pending" },
           ]);
        }
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
    <div className="max-w-[1000px] mx-auto py-8 lg:py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Review Queue</h1>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-xl">
            Pending video evaluations assigned to you. AI pre-processing surfaces critical flags to help you prioritize your workflow.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-[var(--muted)] animate-pulse">Loading queue...</div>
      ) : null}
      
      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
      ) : null}

      {!loading && !error && queue.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
             <div className="text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase mb-2">Total Queue</div>
             <div className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{queue.length}</div>
          </div>
          <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
             <div className="text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase mb-2">Active Projects</div>
             <div className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{byProject.length}</div>
          </div>
          <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
             <div className="text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase mb-2">Pending</div>
             <div className="text-4xl font-semibold tracking-tight text-amber-600">{queue.length - reviewedCount}</div>
          </div>
          <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
             <div className="text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase mb-2">Completed</div>
             <div className="text-4xl font-semibold tracking-tight text-emerald-600">{reviewedCount}</div>
          </div>
        </section>
      )}

      <div className="space-y-12">
        {byProject.map(([projectName, items]) => (
          <section key={projectName}>
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border-soft)] pb-2">
               <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{projectName}</h2>
               <span className="text-xs font-medium text-[var(--muted)]">{items.length} videos</span>
            </div>

            <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="divide-y divide-[var(--border-soft)]">
                {items.map((item) => {
                  const flags = MOCK_FLAGS[item.id] || [];
                  const isReviewed = item.status === "reviewed";
                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                           {isReviewed ? (
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                           ) : (
                             <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-sm animate-pulse" />
                           )}
                           <div className="font-semibold text-[15px] truncate text-[var(--foreground)]">{item.title}</div>
                        </div>
                        
                        {/* Static AI Flags Preview Pipeline */}
                        {flags.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-[20px] sm:ml-0">
                             {flags.map(flag => (
                               <span key={flag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] uppercase font-bold tracking-wider">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                 {flag}
                               </span>
                             ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0 px-[20px] sm:px-0">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isReviewed ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {item.status}
                        </span>
                        <Link
                          href={`/dashboard/review-queue/${item.id}`}
                          className="button-secondary h-9 px-4 rounded-lg flex items-center justify-center text-xs font-semibold hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-all"
                        >
                          {isReviewed ? "View Decision" : "Start Evaluation"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
