"use client";

import { useEffect } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || process.env.WORKER_API_BASE_URL || "http://localhost:8787";

export default function LogoutPage() {
  useEffect(() => {
    fetch(`${WORKER_API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      window.location.href = "/login";
    });
  }, []);

  return (
    <div className="min-h-dvh px-6 py-10 md:px-10 flex items-center justify-center">
      <div className="surface-card rounded-2xl p-8 text-center w-full max-w-md">
        <div className="text-xl font-semibold">Signing you out</div>
        <div className="text-sm text-muted mt-2">Cleaning up your session securely...</div>
      </div>
    </div>
  );
}
