"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type Evaluator = {
  id: number;
  email: string;
  name: string | null;
  assignedCount: number;
};

type Mode = "assign" | "remove";

export default function AssignVideosPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [projectName, setProjectName] = useState("");
  const [totalVideos, setTotalVideos] = useState(0);
  const [unassignedVideos, setUnassignedVideos] = useState(0);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [newAssignments, setNewAssignments] = useState<Record<number, number>>({});
  const [removeAmounts, setRemoveAmounts] = useState<Record<number, number>>({});
  const [evaluatorModes, setEvaluatorModes] = useState<Record<number, Mode>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const newRequestedTotal = useMemo(
    () => Object.values(newAssignments).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [newAssignments]
  );

  const removeRequestedTotal = useMemo(
    () => Object.values(removeAmounts).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [removeAmounts]
  );

  async function load() {
    setLoading(true);
    setError("");
    setNewAssignments({});
    setRemoveAmounts({});
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos/assignment`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load assignment context");
      setProjectName(payload.project?.name || "");
      setTotalVideos(payload.totalVideos || 0);
      setUnassignedVideos(payload.unassignedVideos || 0);
      setEvaluators(payload.evaluators || []);
    } catch (e: any) {
      setError(e.message || "Failed to load assignment context");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  function updateNewAssignment(evaluatorId: number, value: string) {
    const numeric = Math.max(0, Math.floor(Number(value) || 0));
    setNewAssignments((prev) => ({ ...prev, [evaluatorId]: numeric }));
  }

  function updateRemoveAmount(evaluatorId: number, value: string) {
    const numeric = Math.max(0, Math.floor(Number(value) || 0));
    setRemoveAmounts((prev) => ({ ...prev, [evaluatorId]: numeric }));
  }

  function setMode(evaluatorId: number, mode: Mode) {
    setEvaluatorModes((prev) => ({ ...prev, [evaluatorId]: mode }));
    if (mode === "assign") {
      setRemoveAmounts((prev) => ({ ...prev, [evaluatorId]: 0 }));
    } else {
      setNewAssignments((prev) => ({ ...prev, [evaluatorId]: 0 }));
    }
  }

  function autoDistribute() {
    if (evaluators.length === 0 || unassignedVideos === 0) return;
    // Equal distribution: floor division, first N get +1 to handle remainder
    const base = Math.floor(unassignedVideos / evaluators.length);
    const rem = unassignedVideos % evaluators.length;
    const allocations: Record<number, number> = {};
    const modes: Record<number, Mode> = {};
    evaluators.forEach((ev, i) => {
      allocations[ev.id] = i < rem ? base + 1 : base;
      modes[ev.id] = "assign";
    });
    setNewAssignments(allocations);
    setEvaluatorModes(modes);
    setRemoveAmounts({});
  }

  async function assignVideos() {
    setError("");
    setSuccess("");
    if (newRequestedTotal > unassignedVideos) {
      setError(`Requested ${newRequestedTotal} new assignments, but only ${unassignedVideos} videos are unassigned.`);
      return;
    }

    // Optimistically update assignedCount so the "after" badge reflects the change immediately
    setEvaluators((prev) =>
      prev.map((ev) => ({
        ...ev,
        assignedCount: (ev.assignedCount || 0) + (newAssignments[ev.id] || 0),
      }))
    );

    try {
      const payload = {
        allocations: evaluators
          .map((evaluator) => ({
            evaluatorId: evaluator.id,
            additionalCount: newAssignments[evaluator.id] || 0,
          }))
          .filter((a) => a.additionalCount > 0),
      };
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign videos");
      setSuccess(`Assigned ${data.assignedVideos} new videos.`);
      setNewAssignments({});
      await load();
    } catch (e: any) {
      await load();
      setError(e.message || "Failed to assign videos");
    }
  }

  async function unassignVideos() {
    setError("");
    setSuccess("");

    for (const evaluator of evaluators) {
      const amount = removeAmounts[evaluator.id] || 0;
      if (amount === 0) continue;
      if (amount > (evaluator.assignedCount || 0)) {
        setError(`${evaluator.name || evaluator.email} only has ${evaluator.assignedCount} assigned.`);
        return;
      }
    }

    // Optimistically update assignedCount before the API call so the UI is always correct
    setEvaluators((prev) =>
      prev.map((ev) => ({
        ...ev,
        assignedCount: Math.max(0, (ev.assignedCount || 0) - (removeAmounts[ev.id] || 0)),
      }))
    );

    try {
      for (const evaluator of evaluators) {
        const amount = removeAmounts[evaluator.id] || 0;
        if (amount === 0) continue;
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/videos/unassign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ evaluatorId: evaluator.id, count: amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to unassign for ${evaluator.name || evaluator.email}`);
      }
      setSuccess(`Removed ${removeRequestedTotal} video${removeRequestedTotal !== 1 ? "s" : ""} from evaluators.`);
      setRemoveAmounts({});
      await load();
    } catch (e: any) {
      // Revert optimistic update on failure by re-fetching
      await load();
      setError(e.message || "Failed to unassign videos");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Assign Videos</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="rounded-xl border border-[var(--color-primary)]/40 bg-[var(--glow-primary-subtle)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--glow-primary)]"
        >
          Back to Project
        </Link>
      </section>

      <section className="surface-card rounded-2xl p-6">
        {loading ? <div className="text-sm text-muted">Loading...</div> : null}
        {error ? <div className="text-sm text-[var(--color-primary)] mb-2">{error}</div> : null}
        {success ? <div className="text-sm text-emerald-400 mb-2">{success}</div> : null}

      {!loading ? (
        <>
          {/* Header context strip */}
          <div className="mb-8 flex items-center gap-4">
            {/* Left: project identity */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">Project</div>
              <div className="font-semibold text-[var(--foreground)] text-lg">{projectName}</div>
            </div>

            <div className="h-4 w-px bg-[var(--border-soft)] shrink-0" />

            {/* Middle: stats */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">Total</div>
                <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{totalVideos}</div>
              </div>
              <div className="h-4 w-px bg-[var(--border-soft)]" />
              <div className="flex items-center gap-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">Unassigned</div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">{unassignedVideos}</div>
              </div>
              <div className="h-4 w-px bg-[var(--border-soft)]" />
              <div className="flex items-center gap-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">Evaluators</div>
                <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{evaluators.length}</div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: auto-distribute button */}
            {unassignedVideos > 0 && evaluators.length > 0 && (
              <button
                onClick={autoDistribute}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shrink-0"
                title="Distribute all unassigned videos equally across evaluators"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v1.5m6-1.5v1.5m-7.5 4.5h13M4.5 8.25h15M4.5 15.75h15M9 12h12m-12 3.75h15M9 20.25h12" />
                </svg>
                Distribute Evenly
              </button>
            )}
          </div>

          {/* Evaluator assignment list */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">Assign to Evaluators</h2>

            <div className="space-y-3">
              {evaluators.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--border-soft)]">
                    <svg className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--muted)] mb-1">No evaluators assigned to this project.</p>
                  <Link href={`/dashboard/projects/${projectId}`} className="text-sm text-[var(--color-primary)] underline underline-offset-2">
                    Go to project to add evaluators
                  </Link>
                </div>
              )}

              {evaluators.map((evaluator) => {
                const mode = evaluatorModes[evaluator.id] || "assign";
                const additional = newAssignments[evaluator.id] || 0;
                const removeAmount = removeAmounts[evaluator.id] || 0;
                const totalAfterAssign = (evaluator.assignedCount || 0) + additional;
                const totalAfterRemove = Math.max(0, (evaluator.assignedCount || 0) - removeAmount);

                return (
                  <div
                    key={evaluator.id}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 transition-all hover:border-[var(--border-strong)]"
                  >
                    {/* Top row: identity + current count + mode toggle */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--border-soft)] text-sm font-bold text-[var(--muted)]">
                          {(evaluator.name || evaluator.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--foreground)]">{evaluator.name || evaluator.email}</div>
                          <div className="text-xs text-[var(--muted)]">{evaluator.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Mode toggle */}
                        <div className="flex rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)] p-0.5">
                          <button
                            onClick={() => setMode(evaluator.id, "assign")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                              mode === "assign"
                                ? "bg-[var(--color-primary)] text-white shadow-sm"
                                : "text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                          <button
                            onClick={() => setMode(evaluator.id, "remove")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                              mode === "remove"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                            Remove
                          </button>
                        </div>

                        {/* Current count */}
                        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Current</span>
                          <span className="text-base font-bold text-[var(--foreground)] tabular-nums">{evaluator.assignedCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action row: Assign mode */}
                    {mode === "assign" && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm font-medium">Assign more</span>
                        </div>

                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={0}
                            placeholder="Number of videos"
                            className="input-base focus-ring w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-2.5 pr-16 text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
                            value={newAssignments[evaluator.id] || ""}
                            onChange={(e) => updateNewAssignment(evaluator.id, e.target.value)}
                          />
                          {additional > 0 && (
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1">
                              <span className="text-xs text-[var(--muted)]">→</span>
                              <span className="text-sm font-bold text-emerald-400 tabular-nums">{totalAfterAssign}</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">after</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action row: Remove mode */}
                    {mode === "remove" && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                          </svg>
                          <span className="text-sm font-medium">Unassign</span>
                        </div>

                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={0}
                            placeholder="How many to unassign"
                            className="input-base focus-ring w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-2.5 pr-16 text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
                            value={removeAmounts[evaluator.id] || ""}
                            onChange={(e) => updateRemoveAmount(evaluator.id, e.target.value)}
                          />
                          {removeAmount > 0 && (
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1">
                              <span className="text-xs text-[var(--muted)]">→</span>
                              <span className="text-sm font-bold text-rose-400 tabular-nums">{totalAfterRemove}</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">after</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating confirm bar — Assign */}
          {newRequestedTotal > 0 && unassignedVideos > 0 && (
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5">
              <div className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">{newRequestedTotal}</span> video{newRequestedTotal !== 1 ? "s" : ""} will be randomly assigned from the{" "}
                <span className="font-semibold text-[var(--foreground)]">{unassignedVideos}</span> unassigned pool.
              </div>
              <button
                className="button-primary rounded-xl px-6 py-2.5 text-sm font-semibold shrink-0"
                onClick={assignVideos}
              >
                Confirm &amp; Assign
              </button>
            </div>
          )}

          {/* Floating confirm bar — Remove */}
          {removeRequestedTotal > 0 && (
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-rose-900/50 bg-rose-950/20 p-5">
              <div className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">{removeRequestedTotal}</span> video{removeRequestedTotal !== 1 ? "s" : ""} will be moved back to the unassigned pool.
              </div>
              <button
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 shrink-0"
                onClick={unassignVideos}
              >
                Confirm &amp; Remove
              </button>
            </div>
          )}

          {newRequestedTotal === 0 && removeRequestedTotal === 0 && evaluators.length > 0 && unassignedVideos > 0 && (
            <div className="mt-6 text-center text-xs text-[var(--muted)]">
              Switch to Remove mode to unassign videos from an evaluator.
            </div>
          )}

          {unassignedVideos === 0 && evaluators.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-amber-900/30 bg-amber-900/10 px-5 py-3 text-sm text-amber-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All videos are assigned.
            </div>
          )}
        </>
      ) : null}
      </section>
    </div>
  );
}
