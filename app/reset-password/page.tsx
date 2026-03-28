"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Footer from "../components/Footer";
import { WORKER_API_BASE_URL } from "../lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !emailParam) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, emailParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: emailParam, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-emerald-900/40 border border-emerald-700 flex items-center justify-center">
            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Password reset</h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Your password has been reset successfully.
        </p>
        <Link href="/login" className="inline-flex items-center gap-1.5 button-primary rounded-xl px-5 py-2.5 text-sm font-medium mt-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <svg className="h-9 w-9 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mt-3 text-[var(--color-text)]">Set new password</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error ? (
          <div className="rounded-xl bg-rose-900/30 border border-rose-800 text-rose-400 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 1 1 8 0v4" />
            </svg>
          </span>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
            required
            minLength={8}
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
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-base focus-ring w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <div className="mt-5 text-sm text-[var(--color-text-muted)] text-center">
        <Link href="/login" className="hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors">
          Cancel
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-[calc(100dvh-80px)] px-6 py-8 md:px-10 flex items-center justify-center flex-1">
        <div className="w-full max-w-md surface-card rounded-3xl p-7 md:p-8">
          <Suspense
            fallback={
              <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
                Loading...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
