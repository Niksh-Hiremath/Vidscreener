"use client";

import Link from "next/link";
import { IoPersonOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "../components/Footer";
import { WORKER_API_BASE_URL } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "User not found or invalid credentials.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 flex items-center justify-center flex-1">
        <div className="w-full max-w-md surface-card rounded-3xl p-7 md:p-8">
          <div className="mb-6 text-center">
            <div className="flex justify-center">
              <IoPersonOutline className="h-9 w-9 text-[var(--color-text)]" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold mt-3 text-[var(--color-text)]">Login</h1>
            <p className="text-xs text-muted mt-1">Continue to your evaluation workspace.</p>
            <div className="mt-4 h-px bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4" />
                </svg>
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                required
              />
            </div>
            {error ? <div className="text-sm text-[var(--color-primary)]">{error}</div> : null}
            <button type="submit" className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium">
              Sign In
            </button>
          </form>

          <div className="mt-5 text-sm text-muted text-center">
            <Link href="/forgot-password" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors underline underline-offset-2">
              Forgot password?
            </Link>
          </div>
          <div className="mt-3 text-sm text-muted text-center">
            New here?{" "}
            <Link href="/register" className="text-[var(--color-primary)] hover:opacity-80 underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
