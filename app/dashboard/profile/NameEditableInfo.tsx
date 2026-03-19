"use client";

import { useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

export default function NameEditableInfo({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [draftName, setDraftName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveName() {
    if (!editing) {
      setEditing(true);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: draftName }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to update name");
      const nextName = payload?.user?.name || draftName;
      setName(nextName);
      setDraftName(nextName);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface-muted rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-muted">Name</div>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          onClick={saveName}
          aria-label={editing ? "Save name" : "Edit name"}
          title={editing ? "Save" : "Edit"}
          disabled={saving}
        >
          {editing ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 12 5 5L20 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          )}
        </button>
      </div>

      {editing ? (
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="input-base focus-ring mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm"
          maxLength={80}
          autoFocus
        />
      ) : (
        <div className="mt-1 font-medium">{name || "-"}</div>
      )}

      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  );
}
