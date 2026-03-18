import Link from "next/link";
import { getDashboardContext } from "./data";

export default async function DashboardPage() {
  const { user } = await getDashboardContext();
  if (!user) return null;

  if (user.role === "reviewer" || user.role === "evaluator") {
    return (
      <div className="rounded border border-zinc-800 bg-zinc-900 p-6 min-h-[320px]">
        <h1 className="text-2xl font-semibold">Evaluator Dashboard</h1>
        <div className="text-zinc-400 mt-2">Use the sections below to start reviewing videos.</div>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard/projects" className="bg-blue-600 text-white px-3 py-2 rounded">
            My Projects
          </Link>
          <Link href="/dashboard/review-queue" className="bg-zinc-700 text-white px-3 py-2 rounded">
            Review Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6 min-h-[320px]">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="text-zinc-400 mt-2">No widgets added yet.</div>
    </div>
  );
}
