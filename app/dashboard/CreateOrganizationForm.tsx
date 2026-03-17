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
      const baseUrl = process.env.WORKER_API_BASE_URL || "http://localhost:8787";
      const res = await fetch(`${baseUrl}/api/organization/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create organization");
      setSuccess("Organization created! Reloading...");
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block mb-2">Organization Name</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
}
