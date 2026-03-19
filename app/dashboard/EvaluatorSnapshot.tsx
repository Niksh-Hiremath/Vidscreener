"use client";

import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type EvaluatorProject = {
  id: number;
  name: string;
  totalAssignedVideos: number;
  pendingVideos: number;
  reviewedVideos: number;
};

type QueueItem = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  status: string;
};

export default function EvaluatorSnapshot() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<EvaluatorProject[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [projectsRes, queueRes] = await Promise.all([
          fetch(`${WORKER_API_BASE_URL}/api/evaluator/projects`, { credentials: "include" }),
          fetch(`${WORKER_API_BASE_URL}/api/evaluator/review-queue`, { credentials: "include" }),
        ]);
        const [projectsJson, queueJson] = await Promise.all([projectsRes.json(), queueRes.json()]);

        if (!projectsRes.ok) throw new Error(projectsJson.error || "Failed to load projects");
        if (!queueRes.ok) throw new Error(queueJson.error || "Failed to load queue");

        setProjects(projectsJson.projects || []);
        setQueue(queueJson.queue || []);
      } catch (e: any) {
        setError(e.message || "Failed to load evaluator snapshot");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const assignedVideos = projects.reduce((sum, project) => sum + (project.totalAssignedVideos || 0), 0);
    const pendingVideos = projects.reduce((sum, project) => sum + (project.pendingVideos || 0), 0);
    const reviewedVideos = projects.reduce((sum, project) => sum + (project.reviewedVideos || 0), 0);
    return {
      totalProjects: projects.length,
      assignedVideos,
      pendingVideos,
      reviewedVideos,
      queueItems: queue.length,
    };
  }, [projects, queue]);

  if (loading) {
    return <div className="surface-card rounded-2xl p-6 text-sm text-slate-500">Loading snapshot...</div>;
  }

  if (error) {
    return <div className="surface-card rounded-2xl p-6 text-sm text-rose-600">{error}</div>;
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Metric label="Assigned Projects" value={summary.totalProjects} />
      <Metric label="Assigned Videos" value={summary.assignedVideos} />
      <Metric label="Pending Reviews" value={summary.pendingVideos} />
      <Metric label="Reviewed Videos" value={summary.reviewedVideos} />
      {/* <Metric label="Queue Items" value={summary.queueItems} /> */}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <div className="text-[15px] text-slate-600">{label}</div>
      <div className="text-5xl leading-none font-semibold text-slate-900 mt-2">{value}</div>
    </div>
  );
}
