"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "../components/Footer";
import { WORKER_API_BASE_URL } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send reset link.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 flex items-center justify-center flex-1">
        <div className="w-full max-w-md surface-card rounded-3xl p-7 md:p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-900/40 border border-emerald-700 flex items-center justify-center">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-[var(--color-text)]">Check your email</h1>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                If an account with that email exists, we sent a password reset link. The link expires in 1 hour.
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Didn&apos;t get it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSuccess(false); setEmail(""); }}
                  className="text-[var(--color-primary)] underline underline-offset-2 hover:opacity-80"
                >
                  try again
                </button>
              </p>
              <div className="pt-4">
                <Link href="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="flex justify-center">
                  <svg className="h-9 w-9 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold mt-3 text-[var(--color-text)]">Forgot password?</h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
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
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                    required
                  />
                </div>
                {error ? (
                  <div className="text-sm text-[var(--color-primary)]">{error}</div>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <div className="mt-5 text-sm text-[var(--color-text-muted)] text-center">
                Remember your password?{" "}
                <Link href="/login" className="text-[var(--color-primary)] hover:opacity-80 underline underline-offset-2">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
