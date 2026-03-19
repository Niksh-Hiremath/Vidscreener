"use client";

import Link from "next/link";
import { IoPersonAddOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = ["Admin", "Reviewer", "Submitter"];
const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || process.env.WORKER_API_BASE_URL || "http://localhost:8787";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone, roleName: role.toLowerCase() }),
        credentials: "include",
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1200);
      } else {
        const data = await res.json();
        setError(data.error || "User already exists or invalid details.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 flex items-center justify-center">
      <div className="w-full max-w-md surface-card rounded-3xl p-7 md:p-8">
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center gap-2 text-indigo-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 ring-1 ring-indigo-200/70">
              <svg className="h-3 w-3 text-white translate-x-[0.4px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="7 5 19 12 7 19 7 5" />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">VidScreener</span>
          </div>
          <div className="mt-4 flex justify-center">
            <IoPersonAddOutline className="h-9 w-9 text-slate-900" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold mt-2">Signup</h1>
          <p className="text-xs text-muted mt-1">Start evaluating with structured AI support.</p>
          <div className="mt-4 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.5 19.5 0 0 1 5.2 12.8 19.8 19.8 0 0 1 2 4.1 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .8 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.4 1.9.7 2.9.8A2 2 0 0 1 22 16.9z" />
              </svg>
            </span>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-base focus-ring w-full rounded-xl px-3 py-2.5 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          {success ? <div className="text-sm text-emerald-600">Registration successful. Redirecting...</div> : null}

          <button type="submit" className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium">
            Create Account
          </button>
        </form>

        <div className="mt-5 text-sm text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
