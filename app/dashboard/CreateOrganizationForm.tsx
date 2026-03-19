"use client";

import { useState } from "react";

export default function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
        process.env.WORKER_API_BASE_URL ||
        "http://localhost:8787";
      const res = await fetch(`${baseUrl}/api/organization/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create organization");
      setSuccess("Organization created. Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm text-muted">Organization name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-base focus-ring w-full rounded-xl px-3 py-2.5"
        required
      />
      <button type="submit" className="button-primary rounded-xl px-4 py-2 text-sm font-medium" disabled={loading}>
        {loading ? "Creating..." : "Create Organization"}
      </button>
      {error ? <div className="text-sm text-rose-600">{error}</div> : null}
      {success ? <div className="text-sm text-emerald-600">{success}</div> : null}
    </form>
  );
}
