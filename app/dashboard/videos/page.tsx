"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="space-y-4">
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold">Videos</h1>
        <div className="text-zinc-400 mt-1">Grouped by project.</div>
      </div>

      {loading ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div> : null}
      {error ? <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error}</div> : null}

      {!loading && !error && groups.length === 0 ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">No projects found.</div>
      ) : null}

      {groups.map((group) => (
        <section key={group.project.id} className="rounded border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold">{group.project.name}</h2>
              <div className="text-sm text-zinc-400">Total videos: {group.summary.totalVideos}</div>
            </div>
            <Link
              href={`/dashboard/projects/${group.project.id}`}
              className="text-blue-400 underline text-sm"
            >
              Open Project
            </Link>
          </div>

          {group.videos.length === 0 ? (
            <div className="text-zinc-400">No videos uploaded for this project.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.videos.map((video) => (
                <VideoPlayerCard
                  key={video.id}
                  title={video.title}
                  status={video.status}
                  playbackUrl={video.playbackUrl}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
