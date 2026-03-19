"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Project Videos</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:from-indigo-100"
        >
          Back to Project
        </Link>
      </section>

      <section className="surface-card rounded-2xl p-6">
        {loading ? <div className="text-sm text-muted">Loading videos...</div> : null}
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        {!loading && !error && videos.length === 0 ? <div className="text-sm text-muted">No videos yet.</div> : null}

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {videos.map((video) => (
              <VideoPlayerCard key={video.id} title={video.title} status={video.status} playbackUrl={video.playbackUrl} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
