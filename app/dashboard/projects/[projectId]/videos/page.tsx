"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import VideoPlayerCard from "../../VideoPlayerCard";

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

export default function ProjectVideosPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load videos");
        setVideos(payload.videos || []);
      } catch (e: any) {
        setError(e.message || "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Project Videos</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-400 underline text-sm">
          Back to Project
        </Link>
      </div>

      {loading ? <div>Loading videos...</div> : null}
      {error ? <div className="text-red-400">{error}</div> : null}
      {!loading && !error && videos.length === 0 ? <div className="text-zinc-400">No videos yet.</div> : null}

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {videos.map((video) => (
            <VideoPlayerCard
              key={video.id}
              title={video.title}
              status={video.status}
              playbackUrl={video.playbackUrl}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
