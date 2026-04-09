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
  project: { id: number; name: string; description: string | null; status: string };
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

  // Edit project state
  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete project state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  function openEditProject() {
    setEditName(overview?.project?.name || "");
    setEditDescription(overview?.project?.description || "");
    setEditStatus(overview?.project?.status || "active");
    setEditError("");
    setEditingProject(true);
  }

  async function saveEditProject(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSaving(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName, description: editDescription, status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");
      setOverview((prev) => prev ? { ...prev, project: { ...prev.project, ...data.project } } : prev);
      setEditingProject(false);
    } catch (e: any) {
      setEditError(e.message || "Failed to update project");
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteProject() {
    if (deleteConfirmText !== overview?.project?.name) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");
      window.location.href = "/dashboard/projects";
    } catch (e: any) {
      setDeleteError(e.message || "Failed to delete project");
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return <div className="surface-card rounded-2xl p-6">Loading project...</div>;
  }

  if (error) {
    return <div className="surface-card rounded-2xl p-6 text-[var(--color-primary)]">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold tracking-tight">{overview?.project?.name}</h1>
              <span className="text-sm rounded-full bg-emerald-900/30 text-emerald-400 px-3 py-1 capitalize border border-emerald-800 font-medium">
                {overview?.project?.status || "active"}
              </span>
            </div>
            {overview?.project?.description ? (
              <p className="text-sm text-muted mt-2 max-w-2xl">{overview.project.description}</p>
            ) : (
              <p className="text-sm text-muted mt-2">Project-level controls, evidence, and evaluation setup.</p>
            )}
          </div>
          <button
            onClick={openEditProject}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Project
          </button>
        </div>
      </section>

      {/* Edit project modal */}
      {editingProject ? (
        <section className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
          <form onSubmit={saveEditProject} className="space-y-3 max-w-lg">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Project Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm"
                required
                maxLength={120}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm min-h-20 resize-none"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {editError ? <div className="text-sm text-[var(--color-primary)]">{editError}</div> : null}
            <div className="flex gap-2">
              <button type="submit" disabled={editSaving} className="button-primary rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
                {editSaving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" onClick={() => setEditingProject(false)} className="button-secondary rounded-xl px-4 py-2 text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="surface-card rounded-2xl p-6">
            <div className="text-[15px] text-[var(--color-text-muted)]">{stat.label}</div>
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
                  <div className="shrink-0 rounded-lg bg-[var(--glow-primary-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
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
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary)] transition hover:bg-[var(--glow-primary)] hover:text-[var(--color-primary)]"
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
        {evaluatorActionError ? <div className="mt-3 text-sm text-[var(--color-primary)]">{evaluatorActionError}</div> : null}
        {evaluatorActionSuccess ? <div className="mt-3 text-sm text-emerald-400">{evaluatorActionSuccess}</div> : null}

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

            {assignError ? <div className="text-sm text-[var(--color-primary)]">{assignError}</div> : null}
            {assignSuccess ? <div className="text-sm text-emerald-400">{assignSuccess}</div> : null}
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

      {/* Danger zone */}
      <section className="rounded-2xl border border-rose-900/40 bg-rose-950/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-rose-400">Danger Zone</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Deleting a project is permanent and cannot be undone. All submissions, videos, rubrics, and form data will be lost.</p>
          </div>
          <button
            onClick={() => { setDeleteConfirmText(""); setShowDeleteDialog(true); }}
            className="rounded-xl bg-rose-900/40 border border-rose-800 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-900/70 shrink-0"
          >
            Delete Project
          </button>
        </div>
      </section>

      {/* Delete confirmation dialog */}
      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="surface-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-900/40 border border-rose-800 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold">Delete Project</h3>
                <p className="text-xs text-[var(--muted)]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted)] mb-4">
              Type <span className="font-semibold text-[var(--foreground)]">{overview?.project?.name}</span> to confirm deletion:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={overview?.project?.name}
              className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm mb-3"
            />
            {deleteError ? <div className="text-sm text-[var(--color-primary)] mb-3">{deleteError}</div> : null}
            <div className="flex gap-2">
              <button
                onClick={deleteProject}
                disabled={deleteConfirmText !== overview?.project?.name || deleteLoading}
                className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(""); setDeleteError(""); }}
                className="button-secondary rounded-xl px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
