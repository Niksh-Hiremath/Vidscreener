"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [evaluatorActionError, setEvaluatorActionError] = useState("");
  const [evaluatorActionSuccess, setEvaluatorActionSuccess] = useState("");

  const summaryStats = useMemo(
    () => [
      { label: "Total Videos", value: overview?.metrics.totalVideos ?? 0 },
      { label: "Evaluators Assigned", value: overview?.metrics.evaluatorsAssigned ?? 0 },
      { label: "Pending Reviews", value: overview?.metrics.pendingReviews ?? 0 },
      { label: "Videos Evaluated", value: overview?.metrics.videosEvaluated ?? 0 },
    ],
    [overview]
  );

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
    setEvaluatorActionError("");
    setEvaluatorActionSuccess("");
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
    setEvaluatorActionError("");
    setEvaluatorActionSuccess("");
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

  async function removeEvaluator(evaluatorIdToRemove: number) {
    setEvaluatorActionError("");
    setEvaluatorActionSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/evaluators/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ evaluatorId: evaluatorIdToRemove }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to remove evaluator");
      setEvaluatorActionSuccess("Evaluator removed from project.");
      await loadOverview();
    } catch (e: any) {
      setEvaluatorActionError(e.message || "Failed to remove evaluator");
    }
  }

  if (loading) {
    return <div className="surface-card rounded-2xl p-6">Loading project...</div>;
  }

  if (error) {
    return <div className="surface-card rounded-2xl p-6 text-rose-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">{overview?.project?.name}</h1>
        <p className="text-sm text-muted mt-2">Project-level controls, evidence, and evaluation setup.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="surface-card rounded-2xl p-6">
            <div className="text-[15px] text-slate-600">{stat.label}</div>
            <div className="text-5xl leading-none font-semibold mt-2">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="surface-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-lg font-semibold">Evaluation Rubric</h2>
            <p className="text-sm text-muted">Compact criteria view for quick alignment.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/projects/${projectId}/rubrics`} className="button-primary rounded-xl px-3 py-2 text-sm">
              Edit Rubrics
            </Link>
          </div>
        </div>
        {overview?.rubrics?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overview.rubrics.map((rubric) => (
              <div key={rubric.id} className="surface-muted rounded-xl p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{rubric.title}</div>
                  <div className="shrink-0 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {rubric.weight}%
                  </div>
                </div>
                <div className="text-sm text-muted mt-1 line-clamp-1">
                  {rubric.description || "No description"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted">No rubrics configured yet.</div>
        )}
      </section>

      <section className="surface-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-lg font-semibold">Videos</h2>
            <p className="text-sm text-muted">Recent submissions for quick inspection.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/projects/${projectId}/assign-videos`} className="button-primary rounded-xl px-3 py-2 text-sm">
              Assign Videos
            </Link>
            <Link href={`/dashboard/projects/${projectId}/videos`} className="button-secondary rounded-xl px-3 py-2 text-sm">
              View All Videos
            </Link>
          </div>
        </div>
        {overview?.videosPreview?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overview.videosPreview.map((video) => (
              <VideoPlayerCard key={video.id} title={video.title} status={video.status} playbackUrl={video.playbackUrl} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted">No videos added yet.</div>
        )}
      </section>

      <section className="surface-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-lg font-semibold">Assigned Evaluators</h2>
            <p className="text-sm text-muted">Use one evaluator pool across multiple projects.</p>
          </div>
          <button onClick={openAssignEvaluator} className="button-primary rounded-xl px-3 py-2 text-sm">
            Assign Evaluator
          </button>
        </div>
        {overview?.evaluators?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {overview.evaluators.map((evaluator) => (
              <div key={evaluator.id} className="surface-muted rounded-xl p-4 relative">
                <button
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => removeEvaluator(evaluator.id)}
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
                  <div className="text-sm text-muted">{evaluator.email}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted">No evaluators assigned yet.</div>
        )}
        {evaluatorActionError ? <div className="mt-3 text-sm text-rose-600">{evaluatorActionError}</div> : null}
        {evaluatorActionSuccess ? <div className="mt-3 text-sm text-emerald-600">{evaluatorActionSuccess}</div> : null}

        {showAssign ? (
          <form onSubmit={assignEvaluator} className="mt-4 surface-muted rounded-xl p-4 space-y-3">
            <div className="flex gap-3 text-sm">
              <label>
                <input type="radio" className="mr-1" checked={assignMode === "existing"} onChange={() => setAssignMode("existing")} />
                Use Existing
              </label>
              <label>
                <input type="radio" className="mr-1" checked={assignMode === "new"} onChange={() => setAssignMode("new")} />
                Create New
              </label>
            </div>

            {assignMode === "existing" ? (
              <select
                className="input-base focus-ring w-full rounded-xl px-3 py-2.5"
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
                  className="input-base focus-ring w-full rounded-xl px-3 py-2.5"
                  type="email"
                  placeholder="Evaluator email"
                  value={evaluatorEmail}
                  onChange={(e) => setEvaluatorEmail(e.target.value)}
                  required
                />
                <input
                  className="input-base focus-ring w-full rounded-xl px-3 py-2.5"
                  type="text"
                  placeholder="Evaluator name (optional)"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                />
              </div>
            )}

            {assignError ? <div className="text-sm text-rose-600">{assignError}</div> : null}
            {assignSuccess ? <div className="text-sm text-emerald-600">{assignSuccess}</div> : null}
            <div className="flex gap-2">
              <button type="submit" className="button-primary rounded-xl px-3 py-2 text-sm">
                Save Assignment
              </button>
              <button type="button" className="button-secondary rounded-xl px-3 py-2 text-sm" onClick={() => setShowAssign(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="surface-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-lg font-semibold">Submitter Form Preview</h2>
            <p className="text-sm text-muted">What applicants will submit for this project.</p>
          </div>
          <Link href={`/dashboard/projects/${projectId}/form`} className="button-primary rounded-xl px-3 py-2 text-sm">
            Manage Form
          </Link>
        </div>
        {overview?.formFields?.length ? (
          <div className="space-y-2">
            {overview.formFields.map((field, idx) => (
              <div key={`${field.label}-${idx}`} className="surface-muted rounded-xl p-3">
                <div className="font-semibold">{field.label || "Untitled field"}</div>
                <div className="text-sm text-muted mt-1">
                  {field.type}
                  {field.required ? " • Required" : ""}
                  {field.type === "attachment" && field.attachmentTypes?.length
                    ? ` • ${field.attachmentTypes.join(", ")}`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted">No form fields configured yet.</div>
        )}
      </section>
    </div>
  );
}
