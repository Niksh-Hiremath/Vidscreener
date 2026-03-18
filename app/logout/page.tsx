"use client";

import { useEffect } from "react";

const WORKER_API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || process.env.WORKER_API_BASE_URL || "http://localhost:8787";

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 text-center">
      Logging out...
    </div>
  );
}
