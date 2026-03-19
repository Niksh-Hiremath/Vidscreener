"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type Rubric = {
  id: number;
  title: string;
  description: string | null;
  weight: number;
};

type FormField = {
  label: string;
  type: string;
  attachmentTypes?: string[];
};

type Attachment = {
  id: number;
  fileName: string;
  type: string;
  formFieldKey?: string | null;
  url: string;
};

type ReviewItem = {
  rubricId: number;
  rating: number;
  note: string;
};

type Payload = {
  video: { id: number; title: string; playbackUrl: string };
  project: { id: number; name: string };
  rubrics: Rubric[];
  formFields: FormField[];
  submittedFields: Record<string, string>;
  attachments: Attachment[];
  review: { rubricBreakdown: ReviewItem[] };
};

type PanelKey =
  | "rubric"
  | "submitted_form"
  | "attachments"
  | "review"
  | "ai_review"
  | "ai_chat";

const PANELS: { key: PanelKey; label: string }[] = [
  { key: "rubric", label: "Rubric" },
  { key: "submitted_form", label: "Submitted Form" },
  { key: "attachments", label: "Attachments" },
  { key: "review", label: "Review" },
  { key: "ai_review", label: "AI Review" },
  { key: "ai_chat", label: "AI Chat" },
];

export default function EvaluatorReviewPage() {
  const params = useParams<{ videoId: string }>();
  const videoId = Number(params.videoId);

  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState<PanelKey>("rubric");
  const [reviewValues, setReviewValues] = useState<Record<number, { rating: number; note: string }>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluator/review-queue/${videoId}`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load review context");
        setData(payload);

        const seed: Record<number, { rating: number; note: string }> = {};
        const nextExpandedNotes: Record<number, boolean> = {};
        (payload.review?.rubricBreakdown || []).forEach((item: ReviewItem) => {
          const note = item.note || "";
          seed[item.rubricId] = { rating: item.rating || 0, note };
          if (note.trim()) {
            nextExpandedNotes[item.rubricId] = true;
          }
        });
        setReviewValues(seed);
        setExpandedNotes(nextExpandedNotes);
      } catch (e: any) {
        setError(e.message || "Failed to load review context");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [videoId]);

  function setReviewValue(rubricId: number, key: "rating" | "note", value: number | string) {
    setReviewValues((prev) => ({
      ...prev,
      [rubricId]: {
        rating:
          key === "rating"
            ? Math.max(0, Math.min(10, Number(value) || 0))
            : prev[rubricId]?.rating || 0,
        note: key === "note" ? String(value) : prev[rubricId]?.note || "",
      },
    }));
  }

  function setNoteValue(rubricId: number, value: string) {
    setReviewValue(rubricId, "note", value);
    if (value.trim()) {
      setExpandedNotes((prev) => ({ ...prev, [rubricId]: true }));
    }
  }

  async function saveReview() {
    if (!data) return;
    setSaveMessage("");
    if (!(reviewSummary.total > 0 && reviewSummary.completed === reviewSummary.total)) {
      setSaveMessage("Please score all rubric criteria before saving.");
      return;
    }
    setSavingReview(true);
    try {
      const rubricBreakdown = data.rubrics.map((rubric) => ({
        rubricId: rubric.id,
        rating: reviewValues[rubric.id]?.rating || 0,
        note: reviewValues[rubric.id]?.note || "",
      }));
      const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluator/review-queue/${videoId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rubricBreakdown }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save review");
      setSaveMessage("Review saved.");
    } catch (e: any) {
      setSaveMessage(e.message || "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  }

  const reviewSummary = useMemo(() => {
    if (!data) return { completed: 0, total: 0, totalScore: 0 };
    const total = data.rubrics.length;
    let completed = 0;
    let totalScore = 0;
    for (const rubric of data.rubrics) {
      const rating = Math.max(0, Math.min(10, reviewValues[rubric.id]?.rating || 0));
      if (rating > 0) completed += 1;
      totalScore += (rating / 10) * rubric.weight;
    }
    return {
      completed,
      total,
      totalScore: Number(totalScore.toFixed(2)),
    };
  }, [data, reviewValues]);

  if (loading) {
    return <div className="surface-card rounded-2xl p-6">Loading...</div>;
  }

  if (error || !data) {
    return <div className="surface-card rounded-2xl p-6 text-rose-600">{error || "Not found"}</div>;
  }

  return (
    <div className="rounded-none md:rounded-2xl p-4 h-full min-h-0 overflow-hidden flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm text-muted">
          <Link
            href="/dashboard/review-queue"
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-indigo-700 hover:bg-indigo-100 transition"
          >
            Back to Queue
          </Link>
        </div>
        <div className="rounded-lg bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 border border-indigo-200">
          {data.project.name}
        </div>
      </div>
      <h1 className="text-2xl font-semibold mb-1">{data.video.title}</h1>
      <div className="text-muted mb-3 text-sm">Project: {data.project.name}</div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="min-h-0 flex flex-col">
          <div className="rounded-xl border border-[var(--border-soft)] bg-black p-2 flex-1 min-h-0">
            <video
              className="w-full h-full object-contain rounded-lg"
              src={data.video.playbackUrl}
              controls
              autoPlay
              playsInline
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {PANELS.map((panel) => (
              <button
                key={panel.key}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  activePanel === panel.key
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-[var(--border-soft)] text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActivePanel(panel.key)}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4 min-h-0 overflow-hidden scroll-subtle overflow-y-auto">
          {activePanel === "rubric" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold sticky top-0 z-10 bg-white pb-2">Rubric</h2>
              {data.rubrics.map((rubric) => (
                <div key={rubric.id} className="surface-muted rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{rubric.title}</div>
                    <span className="shrink-0 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {rubric.weight}%
                    </span>
                  </div>
                  <div className="text-sm text-muted mt-1">{rubric.description || "No description"}</div>
                </div>
              ))}
            </div>
          ) : null}

          {activePanel === "submitted_form" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold sticky top-0 z-10 bg-white pb-2">Submitted Form</h2>
              {data.formFields.map((field, index) => {
                const key = `${field.label || "field"}-${index}`;
                const value = data.submittedFields[key];
                if (field.type === "attachment") {
                  const attachments = data.attachments.filter(
                    (attachment) => attachment.formFieldKey === `attachment_${index}`
                  );
                  return (
                    <div key={key} className="surface-muted rounded-lg p-3">
                      <div className="font-semibold">{field.label}</div>
                      <div className="text-sm text-muted mt-1">
                        {attachments.length > 0 ? (
                          attachments.map((attachment) => (
                            <div key={attachment.id}>
                              <a href={attachment.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-2">
                                {attachment.fileName}
                              </a>
                            </div>
                          ))
                        ) : (
                          "No attachment"
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key} className="surface-muted rounded-lg p-3">
                    <div className="font-semibold">{field.label}</div>
                    <div className="text-sm text-muted mt-1">{value || "-"}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {activePanel === "attachments" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold sticky top-0 z-10 bg-white pb-2">Attachments</h2>
              {data.attachments.length === 0 ? (
                <div className="text-muted">No non-video attachments.</div>
              ) : (
                data.attachments.map((attachment) => (
                  <div key={attachment.id} className="surface-muted rounded-lg p-3 text-sm">
                    <div>Name: {attachment.fileName}</div>
                    <div>Type: {attachment.type}</div>
                    <div>
                      Link:{" "}
                      <a href={attachment.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-2">
                        Open
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {activePanel === "review" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold sticky top-0 z-10 bg-white pb-2">Review</h2>
              <div className="surface-muted rounded-lg p-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted">Completion</div>
                  <div className="text-lg font-semibold mt-1">
                    {reviewSummary.completed}/{reviewSummary.total}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">Total Score</div>
                  <div className="text-lg font-semibold mt-1">{reviewSummary.totalScore} / 100</div>
                </div>
              </div>

              {data.rubrics.map((rubric) => (
                <div key={rubric.id} className="surface-muted rounded-lg p-3 space-y-2.5">
                  {(() => {
                    const noteValue = reviewValues[rubric.id]?.note || "";
                    const isExpanded = !!expandedNotes[rubric.id] || !!noteValue.trim();
                    return (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold">{rubric.title}</div>
                          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                            {rubric.weight}%
                          </span>
                        </div>
                        <div className="grid grid-cols-[1fr_76px] gap-2 items-center">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            step={1}
                            className="w-full accent-indigo-600"
                            value={reviewValues[rubric.id]?.rating || 0}
                            onChange={(e) => setReviewValue(rubric.id, "rating", Number(e.target.value))}
                          />
                          <input
                            type="number"
                            min={0}
                            max={10}
                            className="input-base focus-ring w-full rounded px-2 py-1.5 text-sm"
                            value={reviewValues[rubric.id]?.rating || 0}
                            onChange={(e) => setReviewValue(rubric.id, "rating", Number(e.target.value))}
                          />
                        </div>
                        {!isExpanded ? (
                          <button
                            type="button"
                            className="text-xs font-medium text-indigo-700 hover:text-indigo-800 w-fit"
                            onClick={() => setExpandedNotes((prev) => ({ ...prev, [rubric.id]: true }))}
                          >
                            + Add note
                          </button>
                        ) : null}
                        {isExpanded ? (
                          <div>
                            <textarea
                              className="input-base focus-ring w-full rounded px-3 py-2 text-sm min-h-16"
                              placeholder="Optional note for this criterion"
                              value={noteValue}
                              onChange={(e) => setNoteValue(rubric.id, e.target.value)}
                              onBlur={() => {
                                if (!noteValue.trim()) {
                                  setExpandedNotes((prev) => ({ ...prev, [rubric.id]: false }));
                                }
                              }}
                            />
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              ))}

              <div className="sticky bottom-0 bg-white pt-3 border-t border-[var(--border-soft)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted">
                    {reviewSummary.completed === reviewSummary.total
                      ? "All criteria scored."
                      : `${reviewSummary.total - reviewSummary.completed} criteria pending.`}
                  </div>
                  <button
                    className="button-primary px-4 py-2 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={saveReview}
                    disabled={savingReview || reviewSummary.completed !== reviewSummary.total || reviewSummary.total === 0}
                  >
                    {savingReview ? "Saving..." : "Save Review"}
                  </button>
                </div>
                {saveMessage ? <div className="text-xs text-muted mt-2">{saveMessage}</div> : null}
              </div>
            </div>
          ) : null}

          {activePanel === "ai_review" ? (
            <div>
              <h2 className="text-xl font-semibold mb-2 sticky top-0 z-10 bg-white pb-2">AI Review</h2>
              <div className="text-muted">AI review placeholder. Backend AI endpoint will be integrated later.</div>
            </div>
          ) : null}

          {activePanel === "ai_chat" ? (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-2 sticky top-0 z-10 bg-white pb-2">AI Chat</h2>
              <div className="text-muted mb-4">
                AI chat placeholder. You will be able to ask why AI rated this way.
              </div>
              <div className="mt-auto input-base rounded-lg p-3 text-muted">
                Type your question here... (coming soon)
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
