import Link from "next/link";
import AdminSnapshot from "./AdminSnapshot";
import EvaluatorSnapshot from "./EvaluatorSnapshot";
import { getDashboardContext } from "./data";

export default async function DashboardPage() {
  const { user, organization } = await getDashboardContext();
  if (!user) return null;

  if (user.role === "reviewer" || user.role === "evaluator") {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl p-6 md:p-7">
          <p className="text-xs uppercase tracking-wide text-indigo-600">Evaluator Workspace</p>
          <h1 className="text-2xl md:text-3xl font-semibold mt-2">Focused review flow</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Use your queue to review assigned videos with rubric guidance, timestamp-grounded AI support,
            and final human scoring.
          </p>
        </section>

        <EvaluatorSnapshot />

        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/review-queue"
            className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 hover:from-indigo-100 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Quick Action</div>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">Open Review Queue</h3>
                <p className="text-sm text-slate-600 mt-1">Prioritize pending videos and complete evaluations.</p>
              </div>
              <svg className="h-5 w-5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 hover:from-indigo-100 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Quick Action</div>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">Assigned Projects</h3>
                <p className="text-sm text-slate-600 mt-1">Track your workload and project-wise review progress.</p>
              </div>
              <svg className="h-5 w-5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="surface-card rounded-2xl p-5">
            <div className="text-xs text-muted">Explainable AI</div>
            <div className="mt-1 font-medium">Timestamp-grounded suggestions</div>
          </div>
          <div className="surface-card rounded-2xl p-5">
            <div className="text-xs text-muted">Human-in-the-loop</div>
            <div className="mt-1 font-medium">Evaluator makes final call</div>
          </div>
          <div className="surface-card rounded-2xl p-5">
            <div className="text-xs text-muted">Review Quality</div>
            <div className="mt-1 font-medium">Rubric-level scoring discipline</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <p className="text-xs uppercase tracking-wide text-indigo-600">Dashboard</p>
        <h1 className="text-2xl md:text-3xl font-semibold mt-2">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted mt-2 max-w-3xl">
          Here's a quick look at what's happening across your organization
          {organization ? `  - ${organization.name}.` : "."}
        </p>
      </section>

      <AdminSnapshot />

      <section className="grid md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/projects"
          className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 hover:from-indigo-100 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Quick Action</div>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">Create Project</h3>
              <p className="text-sm text-slate-600 mt-1">Set up a new video evaluation project.</p>
            </div>
            <svg className="h-5 w-5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/dashboard/evaluators"
          className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 hover:from-indigo-100 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Quick Action</div>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">Manage Evaluators</h3>
              <p className="text-sm text-slate-600 mt-1">Invite evaluators and manage project assignments.</p>
            </div>
            <svg className="h-5 w-5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/dashboard/videos"
          className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 hover:from-indigo-100 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-700">Quick Action</div>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">View Videos</h3>
              <p className="text-sm text-slate-600 mt-1">Browse and track video submissions.</p>
            </div>
            <svg className="h-5 w-5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-5">
          <div className="text-xs text-muted">Explainable AI</div>
          <div className="mt-1 font-medium">Evidence-backed AI insights</div>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <div className="text-xs text-muted">Human-in-the-loop</div>
          <div className="mt-1 font-medium">Evaluator final authority</div>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <div className="text-xs text-muted">Operational Scale</div>
          <div className="mt-1 font-medium">Multi-project, multi-evaluator control</div>
        </div>
      </section>
    </div>
  );
}
