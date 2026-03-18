"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="space-y-4">
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold">Evaluators</h1>
        <div className="text-zinc-400 mt-1">Grouped by project.</div>
      </div>

      {loading ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div> : null}
      {error ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error}</div> : null}
      {success ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-green-400">{success}</div> : null}

      {!loading && !error && groups.length === 0 ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">No projects found.</div>
      ) : null}

      {groups.map((group) => (
        <section key={group.project.id} className="rounded border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold">{group.project.name}</h2>
              <div className="text-sm text-zinc-400">
                Total evaluators: {group.summary.totalEvaluators}
              </div>
            </div>
            <Link
              href={`/dashboard/projects/${group.project.id}`}
              className="text-blue-400 underline text-sm"
            >
              Open Project
            </Link>
          </div>

          {group.evaluators.length === 0 ? (
            <div className="text-zinc-400">No evaluators assigned for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.evaluators.map((evaluator) => (
                <div key={evaluator.id} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                  <div className="font-semibold">{evaluator.name || evaluator.email}</div>
                  <div className="text-sm text-zinc-400 mt-1">{evaluator.email}</div>
                  <button
                    className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => removeEvaluator(group.project.id, evaluator.id)}
                  >
                    Remove from Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
