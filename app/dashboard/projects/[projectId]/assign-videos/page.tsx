"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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

export default function AssignVideosPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [projectName, setProjectName] = useState("");
  const [totalVideos, setTotalVideos] = useState(0);
  const [unassignedVideos, setUnassignedVideos] = useState(0);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestedTotal = useMemo(
    () => Object.values(allocations).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [allocations]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos/assignment`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load assignment context");
      setProjectName(payload.project?.name || "");
      setTotalVideos(payload.totalVideos || 0);
      setUnassignedVideos(payload.unassignedVideos || 0);
      setEvaluators(payload.evaluators || []);
      const nextAllocations: Record<number, number> = {};
      (payload.evaluators || []).forEach((ev: Evaluator) => {
        nextAllocations[ev.id] = 0;
      });
      setAllocations(nextAllocations);
    } catch (e: any) {
      setError(e.message || "Failed to load assignment context");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  function updateAllocation(evaluatorId: number, value: string) {
    const numeric = Math.max(0, Math.floor(Number(value) || 0));
    setAllocations((prev) => ({ ...prev, [evaluatorId]: numeric }));
  }

  async function assignVideos() {
    setError("");
    setSuccess("");
    if (requestedTotal > unassignedVideos) {
      setError(`Requested ${requestedTotal}, but only ${unassignedVideos} videos are unassigned.`);
      return;
    }

    try {
      const payload = {
        allocations: evaluators.map((evaluator) => ({
          evaluatorId: evaluator.id,
          count: allocations[evaluator.id] || 0,
        })),
      };
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign videos");
      setSuccess(`Assigned ${data.assignedVideos} videos successfully.`);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to assign videos");
    }
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Assign Videos</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-400 underline text-sm">
          Back to Project
        </Link>
      </div>

      {loading ? <div>Loading...</div> : null}
      {error ? <div className="text-red-400 mb-2">{error}</div> : null}
      {success ? <div className="text-green-400 mb-2">{success}</div> : null}

      {!loading ? (
        <>
          <div className="rounded border border-zinc-700 bg-zinc-800 p-4 mb-4">
            <div className="font-semibold">{projectName}</div>
            <div className="text-sm text-zinc-400 mt-1">Total videos: {totalVideos}</div>
            <div className="text-sm text-zinc-400">Unassigned videos: {unassignedVideos}</div>
            <div className="text-sm text-zinc-400">Requested assignment: {requestedTotal}</div>
          </div>

          <div className="space-y-3">
            {evaluators.map((evaluator) => (
              <div key={evaluator.id} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                <div className="font-semibold">{evaluator.name || evaluator.email}</div>
                <div className="text-sm text-zinc-400">{evaluator.email}</div>
                <div className="mt-2">
                  <label className="text-sm">Videos to assign</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
                    value={allocations[evaluator.id] || 0}
                    onChange={(e) => updateAllocation(evaluator.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={assignVideos}
          >
            Assign Videos Randomly
          </button>
        </>
      ) : null}
    </div>
  );
}
