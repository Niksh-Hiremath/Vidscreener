"use client";

import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type ProjectSummary = { totalProjects: number; activeProjects: number };

type ProjectResponse = { summary?: ProjectSummary; projects?: Array<{ id: number }> };
type VideoGroup = { summary?: { totalVideos?: number }; videos?: Array<{ status?: string }> };
type EvaluatorGroup = { summary?: { totalEvaluators?: number } };

export default function AdminSnapshot() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectPayload, setProjectPayload] = useState<ProjectResponse | null>(null);
  const [videoGroups, setVideoGroups] = useState<VideoGroup[]>([]);
  const [evaluatorGroups, setEvaluatorGroups] = useState<EvaluatorGroup[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [projectsRes, videosRes, evaluatorsRes] = await Promise.all([
          fetch(`${WORKER_API_BASE_URL}/api/projects`, { credentials: "include" }),
          fetch(`${WORKER_API_BASE_URL}/api/admin/videos`, { credentials: "include" }),
          fetch(`${WORKER_API_BASE_URL}/api/admin/evaluators`, { credentials: "include" }),
        ]);

        const [projectsJson, videosJson, evaluatorsJson] = await Promise.all([
          projectsRes.json(),
          videosRes.json(),
          evaluatorsRes.json(),
        ]);

        if (!projectsRes.ok) throw new Error(projectsJson.error || "Failed to load dashboard stats");
        if (!videosRes.ok) throw new Error(videosJson.error || "Failed to load video stats");
        if (!evaluatorsRes.ok) throw new Error(evaluatorsJson.error || "Failed to load evaluator stats");

        setProjectPayload(projectsJson || null);
        setVideoGroups(videosJson.groups || []);
        setEvaluatorGroups(evaluatorsJson.groups || []);
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const totalProjects = projectPayload?.summary?.totalProjects || projectPayload?.projects?.length || 0;
    const activeProjects = projectPayload?.summary?.activeProjects || 0;

    const totalVideos = videoGroups.reduce((acc, group) => {
      if (group.summary?.totalVideos) return acc + group.summary.totalVideos;
      return acc + (group.videos?.length || 0);
    }, 0);

    const reviewedVideos = videoGroups.reduce(
      (acc, group) => acc + (group.videos || []).filter((video) => video.status === "reviewed").length,
      0
    );

    const totalEvaluators = evaluatorGroups.reduce(
      (acc, group) => acc + (group.summary?.totalEvaluators || 0),
      0
    );

    return {
      totalProjects,
      activeProjects,
      totalVideos,
      reviewedVideos,
      totalEvaluators,
    };
  }, [projectPayload, videoGroups, evaluatorGroups]);

  if (loading) {
    return <div className="surface-card rounded-2xl p-6 text-sm text-slate-500">Loading snapshot...</div>;
  }

  if (error) {
    return <div className="surface-card rounded-2xl p-6 text-sm text-rose-600">{error}</div>;
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
      <Metric label="Total Projects" value={summary.totalProjects} />
      <Metric label="Active Projects" value={summary.activeProjects} />
      <Metric label="Total Submissions" value={summary.totalVideos} />
      <Metric label="Reviewed Videos" value={summary.reviewedVideos} />
      <Metric label="Evaluator Assignments" value={summary.totalEvaluators} />
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
