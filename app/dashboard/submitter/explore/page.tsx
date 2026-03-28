"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || "http://localhost:8787";

type Program = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  organization: { id: number; name: string } | null;
  isInvited: boolean;
  hasSubmitted: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgramBadge({ program }: { program: Program }) {
  if (program.hasSubmitted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Applied
      </span>
    );
  }
  if (program.isInvited) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--glow-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] inline-block" />
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--color-text-muted)] border border-[var(--border-strong)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] inline-block" />
      Open
    </span>
  );
}

export default function ExploreProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/api/submitter/explore`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPrograms(data.programs || []);
      })
      .catch((e) => setError(e.message || "Failed to load programs"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.organization?.name || "").toLowerCase().includes(q)
    );
  });

  // group by status
  const invited = filtered.filter((p) => p.isInvited && !p.hasSubmitted);
  const open = filtered.filter((p) => !p.isInvited && !p.hasSubmitted);
  const submitted = filtered.filter((p) => p.hasSubmitted);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl p-6 md:p-7">
        <p className="text-xs uppercase tracking-wide text-[var(--color-primary)] font-semibold">Submitter Portal</p>
        <h1 className="text-2xl md:text-3xl font-semibold mt-2">Explore Programs</h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Browse all active programs accepting video submissions. Programs you've been directly invited to are highlighted.
        </p>
      </section>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search programs by name, description, or organization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base w-full rounded-xl pl-10 pr-4 py-2.5 text-sm"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-900/30 border border-rose-800 px-4 py-3 text-sm text-rose-400">{error}</div>
      )}

      {programs.length === 0 && !error && (
        <div className="surface-card rounded-2xl p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--surface-2)] flex items-center justify-center">
            <svg className="h-6 w-6 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">No programs available</h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            There are no active programs accepting submissions right now. Check back later.
          </p>
        </div>
      )}

      {/* Invited section */}
      {invited.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-wide font-semibold text-[var(--color-text-muted)] px-1">
            Invited to Apply ({invited.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {invited.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {/* Open section */}
      {open.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-wide font-semibold text-[var(--color-text-muted)] px-1">
            Open Programs ({open.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {open.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {/* Already submitted */}
      {submitted.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-wide font-semibold text-[var(--color-text-muted)] px-1">
            Already Applied ({submitted.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {submitted.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {filtered.length === 0 && programs.length > 0 && (
        <div className="surface-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted">No programs match your search. Try different keywords.</p>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="surface-card rounded-2xl overflow-hidden transition-shadow hover:shadow-md flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            {program.organization && (
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[var(--color-text-muted)] mb-1">{program.organization.name}</p>
            )}
            <h3 className="text-base font-semibold text-[var(--color-text)] leading-tight">{program.name}</h3>
          </div>
          <ProgramBadge program={program} />
        </div>

        {program.description ? (
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">{program.description}</p>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] italic">No description provided.</p>
        )}

        <p className="text-[11px] text-[var(--color-text-muted)] mt-3">Active since {formatDate(program.createdAt)}</p>
      </div>

      <div className="px-5 pb-5 pt-0">
        {program.hasSubmitted ? (
          <Link
            href={`/dashboard/submitter/applications/${program.id}/fill`}
            className="button-secondary w-full inline-flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            View My Submission
          </Link>
        ) : (program.isInvited) ? (
          <Link
            href={`/dashboard/submitter/applications/${program.id}/fill`}
            className="button-primary w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Fill Application
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href={`/dashboard/submitter/applications/${program.id}/fill`}
            className="button-secondary w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
          >
            Apply Now
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl p-7">
        <div className="h-3 bg-[var(--surface-2)] rounded w-28 mb-3" />
        <div className="h-7 bg-[var(--surface-2)] rounded w-1/2 mb-2" />
        <div className="h-3 bg-[var(--surface-2)] rounded w-2/3" />
      </div>
      <div className="h-10 bg-[var(--surface-2)] rounded-xl w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-card rounded-2xl p-5">
            <div className="h-4 bg-[var(--surface-2)] rounded w-2/3 mb-3" />
            <div className="h-3 bg-[var(--surface-2)] rounded w-full mb-2" />
            <div className="h-3 bg-[var(--surface-2)] rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
