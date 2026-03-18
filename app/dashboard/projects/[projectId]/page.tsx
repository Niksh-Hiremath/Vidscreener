"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import VideoPlayerCard from "../VideoPlayerCard";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type Rubric = {
  id: number;
  title: string;
  description: string | null;
  weight: number;
};

type Evaluator = {
  id: number;
  email: string;
  name: string | null;
};

type FormField = {
  label: string;
  type: string;
  required?: boolean;
  attachmentTypes?: string[];
};

type Video = {
  id: number;
  title: string;
  status: string;
  playbackUrl: string;
};

type OverviewPayload = {
  project: { id: number; name: string };
  metrics: {
    totalVideos: number;
    evaluatorsAssigned: number;
    pendingReviews: number;
    videosEvaluated: number;
  };
  rubrics: Rubric[];
  formFields: FormField[];
  videosPreview: Video[];
  evaluators: Evaluator[];
};

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [assignMode, setAssignMode] = useState<"existing" | "new">("existing");
  const [availableEvaluators, setAvailableEvaluators] = useState<Evaluator[]>([]);
  const [evaluatorId, setEvaluatorId] = useState<number | "">("");
  const [evaluatorEmail, setEvaluatorEmail] = useState("");
  const [evaluatorName, setEvaluatorName] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  async function loadOverview() {
    const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/overview`, {
      method: "GET",
      credentials: "include",
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Failed to load project");
    setOverview(payload);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await loadOverview();
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load project");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  async function loadAvailableEvaluators() {
    const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluators`, {
      method: "GET",
      credentials: "include",
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Failed to load evaluators");
    setAvailableEvaluators(payload.evaluators || []);
    if (payload.evaluators?.length) setEvaluatorId(payload.evaluators[0].id);
  }

  async function openAssignEvaluator() {
    setAssignError("");
    setAssignSuccess("");
    setShowAssign(true);
    try {
      await loadAvailableEvaluators();
    } catch (e: any) {
      setAssignError(e.message || "Failed to load evaluators");
    }
  }

  async function assignEvaluator(e: React.FormEvent) {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    try {
      const body =
        assignMode === "existing"
          ? { mode: "existing", evaluatorId }
          : { mode: "new", email: evaluatorEmail, name: evaluatorName };
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/evaluators/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to assign evaluator");
      setAssignSuccess("Evaluator assigned.");
      await loadOverview();
      setTimeout(() => setShowAssign(false), 600);
    } catch (e: any) {
      setAssignError(e.message || "Failed to assign evaluator");
    }
  }

  if (loading) {
    return <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading project...</div>;
  }

  if (error) {
    return <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold mb-4">Project: {overview?.project?.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
            <div className="text-xs text-zinc-400">Total Videos</div>
            <div className="text-2xl font-semibold">{overview?.metrics.totalVideos ?? 0}</div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
            <div className="text-xs text-zinc-400">Evaluators Assigned</div>
            <div className="text-2xl font-semibold">{overview?.metrics.evaluatorsAssigned ?? 0}</div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
            <div className="text-xs text-zinc-400">Pending Reviews</div>
            <div className="text-2xl font-semibold">{overview?.metrics.pendingReviews ?? 0}</div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
            <div className="text-xs text-zinc-400">Videos Evaluated</div>
            <div className="text-2xl font-semibold">{overview?.metrics.videosEvaluated ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Evaluation Rubric</h2>
          <Link
            href={`/dashboard/projects/${projectId}/rubrics`}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Edit Rubrics
          </Link>
        </div>
        {overview?.rubrics?.length ? (
          <div className="space-y-2">
            {overview.rubrics.map((rubric) => (
              <div key={rubric.id} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                <div className="font-semibold">{rubric.title} ({rubric.weight}%)</div>
                <div className="text-zinc-400 text-sm mt-1">{rubric.description || "No description"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">No rubrics configured yet.</div>
        )}
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Videos</h2>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/projects/${projectId}/assign-videos`}
              className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              Assign Videos
            </Link>
            <Link
              href={`/dashboard/projects/${projectId}/videos`}
              className="bg-zinc-700 text-white px-3 py-2 rounded text-sm"
            >
              View All Videos
            </Link>
          </div>
        </div>
        {overview?.videosPreview?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overview.videosPreview.map((video) => (
              <VideoPlayerCard
                key={video.id}
                title={video.title}
                status={video.status}
                playbackUrl={video.playbackUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">No videos added yet.</div>
        )}
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Assigned Evaluators</h2>
          <button onClick={openAssignEvaluator} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
            Assign Evaluator
          </button>
        </div>
        {overview?.evaluators?.length ? (
          <div className="space-y-2">
            {overview.evaluators.map((evaluator) => (
              <div key={evaluator.id} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                <div className="font-semibold">{evaluator.name || evaluator.email}</div>
                <div className="text-sm text-zinc-400">{evaluator.email}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">No evaluators assigned yet.</div>
        )}

        {showAssign ? (
          <form onSubmit={assignEvaluator} className="mt-4 rounded border border-zinc-700 bg-zinc-800 p-4 space-y-3">
            <div className="flex gap-3">
              <label className="text-sm">
                <input
                  type="radio"
                  className="mr-1"
                  checked={assignMode === "existing"}
                  onChange={() => setAssignMode("existing")}
                />
                Use Existing
              </label>
              <label className="text-sm">
                <input
                  type="radio"
                  className="mr-1"
                  checked={assignMode === "new"}
                  onChange={() => setAssignMode("new")}
                />
                Create New
              </label>
            </div>

            {assignMode === "existing" ? (
              <select
                className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
                value={evaluatorId}
                onChange={(e) => setEvaluatorId(e.target.value ? Number(e.target.value) : "")}
                required
              >
                {availableEvaluators.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name || ev.email} ({ev.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
                  type="email"
                  placeholder="Evaluator email"
                  value={evaluatorEmail}
                  onChange={(e) => setEvaluatorEmail(e.target.value)}
                  required
                />
                <input
                  className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
                  type="text"
                  placeholder="Evaluator name (optional)"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                />
              </div>
            )}

            {assignError ? <div className="text-red-400 text-sm">{assignError}</div> : null}
            {assignSuccess ? <div className="text-green-400 text-sm">{assignSuccess}</div> : null}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
                Save Assignment
              </button>
              <button
                type="button"
                className="bg-zinc-700 text-white px-3 py-2 rounded text-sm"
                onClick={() => setShowAssign(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Submitter Form Preview</h2>
          <Link
            href={`/dashboard/projects/${projectId}/form`}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Manage Form
          </Link>
        </div>
        {overview?.formFields?.length ? (
          <div className="space-y-2">
            {overview.formFields.map((field, index) => (
              <div key={`${field.label}-${index}`} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                <div className="font-semibold">{field.label}</div>
                <div className="text-sm text-zinc-400">
                  Type: {field.type}
                  {field.required ? " • Required" : ""}
                  {field.type === "attachment" && Array.isArray(field.attachmentTypes)
                    ? ` • ${field.attachmentTypes.join(", ")}`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">No form fields configured yet.</div>
        )}
      </div>
    </div>
  );
}
