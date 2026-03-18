"use client";

import { useRef } from "react";

export default function VideoPlayerCard({
  title,
  status,
  playbackUrl,
}: {
  title: string;
  status: string;
  playbackUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="rounded border border-zinc-700 bg-zinc-800 p-3">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-xs text-zinc-400 mb-2">{status}</div>

      <video
        ref={videoRef}
        className="w-full rounded bg-black mb-3"
        controls
        preload="metadata"
        src={playbackUrl}
      />
    </div>
  );
}
