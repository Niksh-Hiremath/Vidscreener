"use client";

import { useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 1 1 8 0v4" />
          </svg>
        </span>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
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
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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

      {error ? (
        <div className="rounded-xl bg-rose-900/30 border border-rose-800 text-rose-400 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl bg-emerald-900/30 border border-emerald-800 text-emerald-400 px-4 py-3 text-sm flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Password updated successfully.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="button-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
