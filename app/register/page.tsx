"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["Admin", "Reviewer", "Submitter"];
const WORKER_API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || process.env.WORKER_API_BASE_URL || "http://localhost:8787";

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
        setTimeout(() => router.push("/login"), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "User already exists or invalid details.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-zinc-800 bg-zinc-900 rounded shadow text-zinc-100">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-zinc-700 bg-zinc-800 p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-zinc-700 bg-zinc-800 p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-zinc-700 bg-zinc-800 p-2 rounded"
          required
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border border-zinc-700 bg-zinc-800 p-2 rounded"
        />
        <select value={role} onChange={e => setRole(e.target.value)} className="border border-zinc-700 bg-zinc-800 p-2 rounded">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {error && <div className="text-red-400">{error}</div>}
        {success && <div className="text-green-600">Registration successful! Redirecting...</div>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
      <div className="mt-4 text-sm text-zinc-300">
        Already have an account? <a href="/login" className="text-blue-400 underline">Login</a>
      </div>
    </div>
  );
}
