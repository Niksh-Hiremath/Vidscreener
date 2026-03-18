"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type AdminProject = {
  id: number;
  name: string;
  description: string | null;
  status: string;
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
    return <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div>;
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
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold mb-4">Projects</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded border border-zinc-700 bg-zinc-800 p-4">
            <div className="text-sm text-zinc-400">Total Projects</div>
            <div className="text-2xl font-semibold">{totalProjects}</div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-800 p-4">
            <div className="text-sm text-zinc-400">Active Projects</div>
            <div className="text-2xl font-semibold">{activeProjects}</div>
          </div>
        </div>
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-3">Create Project</h2>
        <form onSubmit={createProject} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
            placeholder="Project name"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2 min-h-24"
            placeholder="Project description"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Project
          </button>
        </form>
        {error ? <div className="mt-3 text-red-400">{error}</div> : null}
        {success ? <div className="mt-3 text-green-400">{success}</div> : null}
      </div>

      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-3">Project Grid</h2>
        {loading ? <div>Loading projects...</div> : null}
        {!loading && projects.length === 0 ? <div className="text-zinc-400">No projects yet.</div> : null}
        {!loading && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="rounded border border-zinc-700 bg-zinc-800 p-4 hover:border-blue-500 hover:bg-zinc-700 transition-colors"
              >
                <div className="font-semibold">{project.name}</div>
                <div className="text-sm text-zinc-400 mt-1 line-clamp-3">
                  {project.description || "No description"}
                </div>
                <div className="text-xs mt-3 inline-block rounded bg-zinc-700 px-2 py-1">
                  {project.status}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EvaluatorProjectsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<EvaluatorProject[]>([]);

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
    <div className="space-y-4">
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <div className="text-zinc-400 mt-1">Only projects assigned to you are listed here.</div>
      </div>

      {loading ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div> : null}
      {error ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error}</div> : null}

      {!loading && !error && projects.length === 0 ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
          No assigned projects yet.
        </div>
      ) : null}

      {projects.map((project) => (
        <div key={project.id} className="rounded border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <Link href="/dashboard/review-queue" className="text-blue-400 underline text-sm">
              Open Queue
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Assigned</div>
              <div className="text-2xl font-semibold">{project.totalAssignedVideos}</div>
            </div>
            <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Pending</div>
              <div className="text-2xl font-semibold">{project.pendingVideos}</div>
            </div>
            <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Reviewed</div>
              <div className="text-2xl font-semibold">{project.reviewedVideos}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
