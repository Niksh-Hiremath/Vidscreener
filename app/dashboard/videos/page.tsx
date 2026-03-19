"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VideoPlayerCard from "../projects/VideoPlayerCard";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type Video = {
  id: number;
  title: string;
  status: string;
  playbackUrl: string;
};

type Group = {
  project: { id: number; name: string };
  summary: { totalVideos: number };
  videos: Video[];
};

export default function VideosPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/admin/videos`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load videos");
        setGroups(payload.groups || []);
      } catch (e: any) {
        setError(e.message || "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Videos</h1>
        <p className="text-sm text-muted mt-2">Submission videos grouped by project.</p>
      </section>

      {loading ? <div className="surface-card rounded-2xl p-6">Loading...</div> : null}
      {error ? <div className="surface-card rounded-2xl p-6 text-rose-600">{error}</div> : null}

      {!loading && !error && groups.length === 0 ? (
        <div className="surface-card rounded-2xl p-6 text-muted">No projects found.</div>
      ) : null}

      {groups.map((group) => (
        <section key={group.project.id} className="surface-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <h2 className="text-lg font-semibold">{group.project.name}</h2>
              <div className="text-sm text-muted">Total videos: {group.summary.totalVideos}</div>
            </div>
            <Link
              href={`/dashboard/projects/${group.project.id}`}
              className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:from-indigo-100"
            >
              Open Project
            </Link>
          </div>

          {group.videos.length === 0 ? (
            <div className="text-sm text-muted">No videos uploaded for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.videos.map((video) => (
                <VideoPlayerCard key={video.id} title={video.title} status={video.status} playbackUrl={video.playbackUrl} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
