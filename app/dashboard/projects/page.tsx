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
          <div className="text-[15px] text-slate-600">Total Projects</div>
          <div className="text-5xl leading-none font-semibold mt-2">{totalProjects}</div>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-slate-600">Active Projects</div>
          <div className="text-5xl leading-none font-semibold mt-2">{activeProjects}</div>
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
          {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
          {success ? <div className="mt-3 text-sm text-emerald-600">{success}</div> : null}
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
                className="surface-card rounded-3xl p-7 transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.01] hover:border-indigo-300/70 hover:bg-indigo-50/30 hover:shadow-[0_10px_26px_rgba(79,70,229,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-xl">{project.name}</div>
                  <div className="text-sm rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 capitalize">
                    {project.status || "active"}
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[34px] leading-none font-semibold mt-2">{project.submissionsCount || 0}</div>
                    <div className="text-sm text-muted mt-1">Submissions</div>
                  </div>
                  <div>
                    <div className="text-[34px] leading-none font-semibold mt-2">{project.evaluatorsCount || 0}</div>
                    <div className="text-sm text-muted mt-1">Evaluators</div>
                  </div>
                </div>
                <div className="mt-6 border-t border-[var(--border-soft)]" />
                <div className="text-[15px] text-muted mt-5">Created {formatProjectDate(project.createdAt)}</div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
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
      {error ? <div className="surface-card rounded-2xl p-6 text-rose-600">{error}</div> : null}

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
                className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:from-indigo-100"
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
      <div className="text-xs text-muted">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <div className="text-[15px] text-slate-600">{title}</div>
      <div className="text-5xl leading-none font-semibold mt-2">{value}</div>
    </div>
  );
}
