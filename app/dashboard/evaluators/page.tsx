"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type Evaluator = {
  id: number;
  email: string;
  name: string | null;
};

type Group = {
  project: { id: number; name: string };
  summary: { totalEvaluators: number };
  evaluators: Evaluator[];
};

export default function EvaluatorsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/admin/evaluators`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load evaluators");
      setGroups(payload.groups || []);
    } catch (e: any) {
      setError(e.message || "Failed to load evaluators");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeEvaluator(projectId: number, evaluatorId: number) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/evaluators/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ evaluatorId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to remove evaluator");
      setSuccess("Evaluator removed from project. Their assigned videos are now unassigned.");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to remove evaluator");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Evaluators</h1>
        <p className="text-sm text-muted mt-2">Assignments grouped by project.</p>
      </section>

      {loading ? <div className="surface-card rounded-2xl p-6">Loading...</div> : null}
      {error ? <div className="surface-card rounded-2xl p-6 text-rose-600">{error}</div> : null}
      {success ? <div className="surface-card rounded-2xl p-6 text-emerald-600">{success}</div> : null}

      {!loading && !error && groups.length === 0 ? (
        <div className="surface-card rounded-2xl p-6 text-muted">No projects found.</div>
      ) : null}

      {groups.map((group) => (
        <section key={group.project.id} className="surface-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <h2 className="text-lg font-semibold">{group.project.name}</h2>
              <div className="text-sm text-muted">Total evaluators: {group.summary.totalEvaluators}</div>
            </div>
            <Link
              href={`/dashboard/projects/${group.project.id}`}
              className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:from-indigo-100"
            >
              Open Project
            </Link>
          </div>

          {group.evaluators.length === 0 ? (
            <div className="text-sm text-muted">No evaluators assigned for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.evaluators.map((evaluator) => (
                <div key={evaluator.id} className="surface-muted rounded-xl p-4 relative">
                  <button
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeEvaluator(group.project.id, evaluator.id)}
                    aria-label="Remove evaluator from project"
                    title="Remove evaluator"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                  <div className="pr-10">
                    <div className="font-semibold">{evaluator.name || evaluator.email}</div>
                    <div className="text-sm text-muted mt-1">{evaluator.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
