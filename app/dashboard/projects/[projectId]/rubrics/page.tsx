"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type RubricInput = {
  title: string;
  description: string;
  weight: number;
};

export default function ProjectRubricsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const [rubrics, setRubrics] = useState<RubricInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const totalWeight = useMemo(
    () => rubrics.reduce((sum, rubric) => sum + (Number.isFinite(rubric.weight) ? rubric.weight : 0), 0),
    [rubrics]
  );
  const hasEmptyTitle = useMemo(
    () => rubrics.some((rubric) => !rubric.title.trim()),
    [rubrics]
  );
  const canSave = rubrics.length > 0 && totalWeight === 100 && !hasEmptyTitle && !saving;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/rubrics`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load rubrics");
        setRubrics(
          (payload.rubrics || []).map((r: any) => ({
            title: r.title || "",
            description: r.description || "",
            weight: Number(r.weight) || 0,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Failed to load rubrics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  function updateRubric(index: number, key: keyof RubricInput, value: string | number) {
    setRubrics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function addRubric() {
    setRubrics((prev) => [...prev, { title: "", description: "", weight: Math.max(0, 100 - totalWeight) }]);
  }

  function removeRubric(index: number) {
    setRubrics((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function saveRubrics() {
    setError("");
    setSuccess("");
    if (rubrics.length === 0) {
      setError("Add at least one rubric.");
      return;
    }
    if (hasEmptyTitle) {
      setError("Each rubric must have a title.");
      return;
    }
    if (totalWeight !== 100) {
      setError(`Total rubric weight must equal 100. Current total: ${totalWeight}.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/rubrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rubrics }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save rubrics");
      setSuccess("Rubrics saved.");
    } catch (e: any) {
      setError(e.message || "Failed to save rubrics");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Rubrics</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="rounded-xl border border-[var(--color-primary)]/40 bg-[var(--glow-primary-subtle)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--glow-primary)]"
        >
          Back to Project
        </Link>
      </section>

      <section className="surface-card rounded-2xl p-6">
        {loading ? <div className="text-sm text-muted">Loading...</div> : null}
        {error ? <div className="text-sm text-[var(--color-primary)] mb-3">{error}</div> : null}
        {success ? <div className="text-sm text-emerald-400 mb-3">{success}</div> : null}

        <div className="surface-muted rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[var(--color-text)]">Weight Distribution</div>
              <div className="text-xs text-muted mt-1">All rubric weights must add up to 100%.</div>
            </div>
            <div className={`text-sm font-semibold ${totalWeight === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              Total: {totalWeight}%
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${totalWeight === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
              style={{ width: `${Math.min(100, Math.max(0, totalWeight))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {rubrics.map((rubric, index) => (
            <div key={`rubric-${index}`} className="surface-muted rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Criterion {index + 1}</div>
                <button
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-primary)] transition hover:bg-[var(--glow-primary)] hover:text-[var(--color-primary)]"
                  onClick={() => removeRubric(index)}
                  aria-label="Remove rubric"
                  title="Remove rubric"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-[1fr_112px] gap-2.5">
                <input
                  className="input-base focus-ring w-full rounded-xl px-3 py-2"
                  placeholder="Rubric title"
                  value={rubric.title}
                  onChange={(e) => updateRubric(index, "title", e.target.value)}
                />
                <div>
                  <label className="text-xs text-muted">Weight %</label>
                  <input
                    className="input-base focus-ring mt-1 w-full rounded-xl px-2.5 py-2"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Weight"
                    value={rubric.weight}
                    onChange={(e) =>
                      updateRubric(index, "weight", Math.max(0, Math.min(100, Number(e.target.value) || 0)))
                    }
                  />
                </div>
              </div>

              <textarea
                className="input-base focus-ring w-full rounded-xl px-3 py-2 min-h-16 mt-2.5"
                placeholder="Description (what evaluators should look for)"
                value={rubric.description}
                onChange={(e) => updateRubric(index, "description", e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="button-secondary rounded-xl px-3 py-2 text-sm" onClick={addRubric}>
            Add Rubric
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm ${
              canSave ? "button-primary" : "button-secondary opacity-60 cursor-not-allowed"
            }`}
            onClick={saveRubrics}
            disabled={!canSave}
          >
            {saving ? "Saving..." : "Save Rubrics"}
          </button>
          {rubrics.length > 0 && totalWeight !== 100 ? (
            <div className="text-xs text-amber-400 self-center">Adjust weights to make total exactly 100%.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
