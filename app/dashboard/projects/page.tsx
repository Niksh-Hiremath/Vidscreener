"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type AdminProject = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  submissionsCount: number;
  evaluatorsCount: number;
};

type EvaluatorProject = {
  id: number;
  name: string;
  totalAssignedVideos: number;
  pendingVideos: number;
  reviewedVideos: number;
};

export default function ProjectsPage() {
  const [role, setRole] = useState<string>("");
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function loadRole() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/user/profile`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (res.ok) setRole(payload.user?.role || "");
      } finally {
        setLoadingRole(false);
      }
    }
    loadRole();
  }, []);

  if (loadingRole) {
    return <div className="surface-card rounded-2xl p-6">Loading...</div>;
  }

  if (role === "reviewer" || role === "evaluator") {
    return <EvaluatorProjectsSection />;
  }

  return <AdminProjectsSection />;
}

function AdminProjectsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProject | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function formatProjectDate(createdAt: string) {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return createdAt;
    return date.toLocaleDateString("en-US");
  }

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load projects");
      setProjects(payload.projects || []);
      setTotalProjects(payload.summary?.totalProjects || 0);
      setActiveProjects(payload.summary?.activeProjects || 0);
    } catch (e: any) {
      setError(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to create project");
      setSuccess("Project created.");
      setName("");
      setDescription("");
      await loadProjects();
    } catch (e: any) {
      setError(e.message || "Failed to create project");
    }
  }

  async function deleteProject() {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");
      setDeleteTarget(null);
      setDeleteConfirmText("");
      await loadProjects();
    } catch (e: any) {
      setDeleteError(e.message || "Failed to delete project");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted mt-2">Manage all your evaluation projects.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="button-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            {showCreateForm ? "Close" : "+ New Project"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-[var(--color-text-muted)]">Total Projects</div>
          <div className="text-5xl leading-none font-semibold mt-2 text-[var(--color-text)]">{totalProjects}</div>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-[var(--color-text-muted)]">Active Projects</div>
          <div className="text-5xl leading-none font-semibold mt-2 text-[var(--color-text)]">{activeProjects}</div>
        </div>
      </section>

      {showCreateForm ? (
        <section className="surface-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Create Project</h2>
          <form onSubmit={createProject} className="space-y-3 mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base focus-ring w-full rounded-xl px-3 py-2.5"
              placeholder="Project name"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base focus-ring w-full rounded-xl px-3 py-2.5 min-h-24"
              placeholder="Project description"
            />
            <div className="flex gap-2">
              <button type="submit" className="button-primary rounded-xl px-4 py-2 text-sm font-medium">
                Create Project
              </button>
              <button
                type="button"
                className="button-secondary rounded-xl px-4 py-2 text-sm font-medium"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
          {error ? <div className="mt-3 text-sm text-[var(--color-primary)]">{error}</div> : null}
          {success ? <div className="mt-3 text-sm text-emerald-400">{success}</div> : null}
        </section>
      ) : null}

      <section>
        {loading ? <div className="mt-3 text-sm text-muted">Loading projects...</div> : null}
        {!loading && projects.length === 0 ? <div className="mt-3 text-sm text-muted">No projects yet.</div> : null}
        {!loading && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="surface-card rounded-3xl p-7 transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[var(--color-primary)]/50 hover:bg-[var(--glow-primary-subtle)] relative group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-xl text-[var(--color-text)]">{project.name}</div>
                  <div className="text-sm rounded-full bg-emerald-900/30 text-emerald-400 px-3 py-1.5 capitalize border border-emerald-800">
                    {project.status || "active"}
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[34px] leading-none font-semibold mt-2 text-[var(--color-text)]">{project.submissionsCount || 0}</div>
                    <div className="text-sm text-[var(--color-text-muted)] mt-1">Submissions</div>
                  </div>
                  <div>
                    <div className="text-[34px] leading-none font-semibold mt-2 text-[var(--color-text)]">{project.evaluatorsCount || 0}</div>
                    <div className="text-sm text-[var(--color-text-muted)] mt-1">Evaluators</div>
                  </div>
                </div>
                <div className="mt-6 border-t border-[var(--color-border)]" />
                <div className="text-[15px] text-[var(--color-text-muted)] mt-5">Created {formatProjectDate(project.createdAt)}</div>

                {/* Delete button — visible on hover */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(project); setDeleteConfirmText(""); setDeleteError(""); }}
                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-rose-900/50 border border-rose-800 p-1.5 text-rose-400 hover:bg-rose-900/80"
                  title="Delete project"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.167 48.167 0 00-7.5 0" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* Delete confirmation dialog */}
      {deleteTarget ? (
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
              Type <span className="font-semibold text-[var(--foreground)]">{deleteTarget.name}</span> to confirm deletion:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={deleteTarget.name}
              className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm mb-3"
            />
            {deleteError ? <div className="text-sm text-[var(--color-primary)] mb-3">{deleteError}</div> : null}
            <div className="flex gap-2">
              <button
                onClick={deleteProject}
                disabled={deleteConfirmText !== deleteTarget.name || deleteLoading}
                className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); setDeleteError(""); }}
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

function EvaluatorProjectsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<EvaluatorProject[]>([]);

  const summary = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.assigned += project.totalAssignedVideos || 0;
        acc.pending += project.pendingVideos || 0;
        acc.reviewed += project.reviewedVideos || 0;
        return acc;
      },
      { assigned: 0, pending: 0, reviewed: 0 }
    );
  }, [projects]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluator/projects`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load projects");
        setProjects(payload.projects || []);
      } catch (e: any) {
        setError(e.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">My Projects</h1>
        <p className="text-sm text-muted mt-2">Projects currently assigned to you.</p>
      </section>

      {loading ? <div className="surface-card rounded-2xl p-6">Loading...</div> : null}
      {error ? <div className="surface-card rounded-2xl p-6 text-[var(--color-primary)]">{error}</div> : null}

      {!loading && !error && projects.length === 0 ? (
        <div className="surface-card rounded-2xl p-6 text-muted">No assigned projects yet.</div>
      ) : null}

      {!loading && !error && projects.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Assigned Projects" value={projects.length} />
          <StatCard title="Assigned Videos" value={summary.assigned} />
          <StatCard title="Pending Reviews" value={summary.pending} />
          <StatCard title="Reviewed Videos" value={summary.reviewed} />
        </section>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <article key={project.id} className="surface-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <Link
                href="/dashboard/review-queue"
                className="rounded-xl border border-[var(--color-primary)]/40 bg-[var(--glow-primary-subtle)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--glow-primary)]"
              >
                Open Queue
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <Stat title="Assigned" value={project.totalAssignedVideos} />
              <Stat title="Pending" value={project.pendingVideos} />
              <Stat title="Reviewed" value={project.reviewedVideos} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="surface-muted rounded-xl p-3">
      <div className="text-xs text-[var(--color-text-muted)]">{title}</div>
      <div className="text-2xl font-semibold mt-1 text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <div className="text-[15px] text-[var(--color-text-muted)]">{title}</div>
      <div className="text-5xl leading-none font-semibold mt-2 text-[var(--color-text)]">{value}</div>
    </div>
  );
}
