"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type RubricInput = {
  title: string;
  description: string;
  weight: number;
};

export default function ProjectRubricsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const [rubrics, setRubrics] = useState<RubricInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/rubrics`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load rubrics");
        setRubrics(
          (payload.rubrics || []).map((r: any) => ({
            title: r.title || "",
            description: r.description || "",
            weight: Number(r.weight) || 0,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Failed to load rubrics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  function updateRubric(index: number, key: keyof RubricInput, value: string | number) {
    setRubrics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function addRubric() {
    setRubrics((prev) => [...prev, { title: "", description: "", weight: 0 }]);
  }

  function removeRubric(index: number) {
    setRubrics((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function saveRubrics() {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/rubrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rubrics }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save rubrics");
      setSuccess("Rubrics saved.");
    } catch (e: any) {
      setError(e.message || "Failed to save rubrics");
    }
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Manage Rubrics</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-400 underline text-sm">
          Back to Project
        </Link>
      </div>

      {loading ? <div>Loading...</div> : null}
      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      {success ? <div className="text-green-400 mb-3">{success}</div> : null}

      <div className="space-y-3">
        {rubrics.map((rubric, index) => (
          <div key={`rubric-${index}`} className="rounded border border-zinc-700 bg-zinc-800 p-3 space-y-2">
            <input
              className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
              placeholder="Rubric title"
              value={rubric.title}
              onChange={(e) => updateRubric(index, "title", e.target.value)}
            />
            <textarea
              className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2 min-h-20"
              placeholder="Description"
              value={rubric.description}
              onChange={(e) => updateRubric(index, "description", e.target.value)}
            />
            <input
              className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
              type="number"
              placeholder="Weight"
              value={rubric.weight}
              onChange={(e) => updateRubric(index, "weight", Number(e.target.value))}
            />
            <button
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => removeRubric(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="bg-zinc-700 text-white px-3 py-2 rounded" onClick={addRubric}>
          Add Rubric
        </button>
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={saveRubrics}>
          Save Rubrics
        </button>
      </div>
    </div>
  );
}
