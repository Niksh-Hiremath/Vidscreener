"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WORKER_API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || process.env.WORKER_API_BASE_URL || "http://localhost:8787";

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
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <Link href="/dashboard" className="text-blue-600 underline mb-4 inline-block">Dashboard</Link>
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
      <div className="mt-4 text-sm">
        Don&apos;t have an account? <a href="/register" className="text-blue-600 underline">Register</a>
      </div>
    </div>
  );
}
