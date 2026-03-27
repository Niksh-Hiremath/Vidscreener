"use client";

import Link from "next/link";
import { IoPersonAddOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "../components/Footer";
import { WORKER_API_BASE_URL } from "../lib/api";

const ROLES = ["Admin", "Reviewer", "Submitter"];

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
    <div className="min-h-screen flex flex-col">
      <div className="min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 flex items-center justify-center flex-1">
        <div className="w-full max-w-md surface-card rounded-3xl p-7 md:p-8">
          <div className="mb-6 text-center">
            <div className="flex justify-center">
              <IoPersonAddOutline className="h-9 w-9 text-[var(--color-text)]" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold mt-3 text-[var(--color-text)]">Create Account</h1>
            <p className="text-xs text-muted mt-1">Start evaluating with structured AI support.</p>
            <div className="mt-4 h-px bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
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

            {error ? <div className="text-sm text-[var(--color-primary)]">{error}</div> : null}
            {success ? <div className="text-sm text-emerald-500">Registration successful. Redirecting...</div> : null}

            <button type="submit" className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium">
              Create Account
            </button>
          </form>

          <div className="mt-5 text-sm text-muted text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] hover:opacity-80 underline underline-offset-2">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
