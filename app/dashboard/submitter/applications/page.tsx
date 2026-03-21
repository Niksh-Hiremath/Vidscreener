"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || "http://localhost:8787";

type ReviewProgress = { total: number; reviewed: number };
type Submission = { id: number; submittedAt: string; reviewProgress: ReviewProgress | null };
type Application = {
  shareId: number;
  sharedAt: string;
  message: string | null;
  project: { id: number; name: string; description: string | null; status: string };
  organization: { id: number; name: string } | null;
  submission: Submission | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ submission }: { submission: Submission | null }) {
  if (!submission) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Pending
      </span>
    );
  }
  const { total, reviewed } = submission.reviewProgress ?? { total: 0, reviewed: 0 };
  if (total > 0 && reviewed === total) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Review Complete
      </span>
    );
  }
  if (total > 0 && reviewed > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Under Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
      Submitted
    </span>
  );
}

function ProgressBar({ reviewed, total }: { reviewed: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((reviewed / total) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
        <span>Review progress</span>
        <span>{reviewed}/{total} videos reviewed</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SubmitterApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/submitter/applications`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setApplications(data.applications || []);
      })
      .catch((e) => setError(e.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="surface-card rounded-2xl p-8 text-center">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header count={applications.length} />

      {applications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.shareId} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ count }: { count?: number }) {
  return (
    <section className="rounded-2xl p-6 md:p-7">
      <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Submitter Portal</p>
      <h1 className="text-2xl md:text-3xl font-semibold mt-2">My Applications</h1>
      <p className="text-sm text-muted mt-2 max-w-2xl">
        Track all the programs you've been invited to submit for. Fill out shared forms and monitor your submission status in real time.
      </p>
      {count !== undefined && count > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
          <span className="font-semibold text-slate-800">{count}</span> program{count !== 1 ? "s" : ""} shared with you
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="surface-card rounded-2xl p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center">
        <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">No applications yet</h3>
      <p className="text-sm text-muted max-w-sm mx-auto">
        You haven't been invited to submit for any programs yet. Browse live programs below or wait for an admin to share a form with you.
      </p>
      <Link
        href="/dashboard/submitter/explore"
        className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Explore Programs
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const { project, organization, submission, sharedAt, message } = app;
  const rp = submission?.reviewProgress ?? null;

  return (
    <div className="surface-card rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              {organization && (
                <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">
                  {organization.name}
                </span>
              )}
              <StatusBadge submission={submission} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>

          <div className="shrink-0">
            {!submission ? (
              <Link
                href={`/dashboard/submitter/applications/${project.id}/fill`}
                className="button-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              >
                Fill Application
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/dashboard/submitter/applications/${project.id}/fill`}
                className="button-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              >
                View Submission
              </Link>
            )}
          </div>
        </div>

        {rp && rp.total > 0 && (
          <ProgressBar reviewed={rp.reviewed} total={rp.total} />
        )}

        <div className="mt-4 pt-4 border-t border-[var(--border-soft)] flex items-center gap-4 flex-wrap text-[12px] text-slate-500">
          <span>Shared {formatDate(sharedAt)}</span>
          {submission && <span>Submitted {formatDate(submission.submittedAt)}</span>}
        </div>

        {message && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs text-indigo-700 leading-relaxed">
              <span className="font-semibold">Note from organizer: </span>{message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
