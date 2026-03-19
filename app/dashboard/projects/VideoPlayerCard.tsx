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
    <div className="surface-muted rounded-xl p-3">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-xs text-muted mb-2 capitalize">{status}</div>

      <video
        ref={videoRef}
        className="w-full rounded-lg bg-black mb-1 aspect-video object-contain"
        controls
        preload="metadata"
        src={playbackUrl}
      />
    </div>
  );
}
