"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

type PanelKey = "ai_review" | "review" | "ai_chat" | "rubric" | "submitted_form" | "attachments";

const PANELS: { key: PanelKey; label: string }[] = [
  { key: "ai_review", label: "AI Review Analysis" },
  { key: "review", label: "Human Overrides" },
  { key: "ai_chat", label: "AI Assistant" },
  { key: "rubric", label: "Rubric Specs" },
  { key: "submitted_form", label: "Submitted Form" },
  { key: "attachments", label: "Attachments" },
];

const MOCK_FLAGS: Record<number, string[]> = {
  1: ["No clear audio (01:10 - 01:34)", "Multiple languages detected"],
  2: ["Highly scripted cadence detected"],
  3: ["Compliance Risk"],
};

// Generates a stable deterministic AI mock score for a rubric to show prefilling.
function getMockAiScore(rubricId: number, weight: number = 10): number {
  return (rubricId % 4) + 6 - (10 - weight); // Returns a score between 6 and 9
}

export default function EvaluatorReviewPage() {
  const params = useParams<{ videoId: string }>();
  // default to 1 if NaN for mock design testing
  const videoId = Number(params.videoId) || 1;

  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState<PanelKey>("ai_review");
  const [reviewValues, setReviewValues] = useState<Record<number, { rating: number; note: string }>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function seekToTime(seconds: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/evaluator/review-queue/${videoId}`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();

        let dataToUse: Payload;

        if (!res.ok) {
          throw new Error(payload.error || "Failed to load review context");
        } else {
           dataToUse = payload;
        }

        setData(dataToUse);

        // Pre-fill human overrides with AI scores (or existing human scores if they already adjusted it).
        const seed: Record<number, { rating: number; note: string }> = {};
        const nextExpandedNotes: Record<number, boolean> = {};

        const existingBreakdown = dataToUse.review?.rubricBreakdown || [];

        dataToUse.rubrics.forEach(rubric => {
          const existing = existingBreakdown.find(b => b.rubricId === rubric.id);
          const aiMockScore = getMockAiScore(rubric.id);

          // Use human rating if it exists and is > 0, else default to AI score
          const rating = (existing && existing.rating > 0) ? existing.rating : aiMockScore;
          const note = existing?.note || "";

          seed[rubric.id] = { rating, note };
          if (note.trim()) {
            nextExpandedNotes[rubric.id] = true;
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
        rating: key === "rating" ? Math.max(0, Math.min(10, Number(value) || 0)) : prev[rubricId]?.rating || 0,
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
    if (!data) return { completed: 0, total: 0, totalScore: 0, totalAiScore: 0 };
    const total = data.rubrics.length;
    let completed = 0;
    let totalScore = 0;
    for (const rubric of data.rubrics) {
      const rating = Math.max(0, Math.min(10, reviewValues[rubric.id]?.rating || 0));
      if (rating > 0) completed += 1;
      totalScore += (rating / 10) * rubric.weight;
    }
    // Also calculate the total AI score strictly from the AI base to display in the AI tab
    let totalAiScore = 0;
    for (const rubric of data.rubrics) {
       totalAiScore += (getMockAiScore(rubric.id, rubric.weight));
    }
    return { completed, total, totalScore: Number(totalScore.toFixed(2)), totalAiScore: Number(totalAiScore.toFixed(2)) };
  }, [data, reviewValues]);

  const flags = MOCK_FLAGS[videoId] || [];

  if (loading) return <div className="p-12 text-center text-[var(--muted)] animate-pulse font-medium">Loading evaluation studio...</div>;
  if (error || !data) return <div className="p-12 text-center text-[var(--color-primary)] font-medium">{error || "Not found"}</div>;

  const RADIUS = 28;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const DASH_OFFSET = CIRCUMFERENCE - (reviewSummary.totalAiScore / 100) * CIRCUMFERENCE;

  return (
    <div className="rounded-none md:rounded-2xl p-4 h-full min-h-0 overflow-hidden flex flex-col max-w-[1500px] mx-auto min-h-[calc(100dvh-64px)]">
      {/* Top Header Row with Subtle, Intuitive Bold Colored Flags */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
           <Link
              href="/dashboard/review-queue"
              className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5"
           >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Queue
           </Link>
           <span className="text-[var(--border-strong)]">/</span>
           <span className="text-[12px] text-[var(--muted)] font-medium">{data.project.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
           <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] leading-none">{data.video.title}</h1>
           {flags.length > 0 && (
             <div className="flex flex-wrap items-center gap-2">
                {flags.map((flag, idx) => {
                  const isCritical = flag.toLowerCase().includes("risk") || flag.toLowerCase().includes("scripted");
                  return (
                    <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] uppercase font-bold tracking-wider shadow-sm transition-colors ${
                      isCritical ? 'bg-rose-900/30 border-rose-800 text-rose-400' : 'bg-amber-900/30 border-amber-800 text-amber-400'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {flag}
                    </span>
                  );
                })}
             </div>
           )}
        </div>
      </div>

      {/* Main Studio Split Grid - Original 2fr 1fr proportional sizing */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 flex-1 min-h-0 overflow-hidden">

        {/* Left Side: Video & Tooling Tabs */}
        <div className="min-h-0 flex flex-col gap-3">
          <div className="rounded-xl border border-[var(--border-soft)] bg-black p-1 shadow-[var(--shadow-md)] flex-1 min-h-0 flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain rounded-lg"
              src={data.video.playbackUrl}
              controls
              playsInline
            />
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {PANELS.map((panel) => (
              <button
                key={panel.key}
                onClick={() => setActivePanel(panel.key)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  activePanel === panel.key
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-[var(--shadow-sm)]"
                    : "bg-[var(--surface-1)] border border-[var(--border-soft)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
                }`}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Active Analysis Panel */}
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)] h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scroll-subtle p-5 md:p-6">

            {/* 1. AI REVIEW SECTION */}
            {activePanel === "ai_review" ? (
              <div className="flex flex-col h-full animate-fade-in-up">

                {/* AI Review Header with Circular SVG Score Indicator */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-[var(--border-soft)]">
                   <div className="pt-1">
                     <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">AI Synthesis</h2>
                     <p className="text-[13px] text-[var(--muted)] mt-1 font-medium">Automated first-pass evaluation.</p>
                   </div>

                   <div className="flex flex-col items-center gap-1.5">
                      <div className="relative w-[70px] h-[70px] flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                           {/* Tracker Background */}
                           <circle className="text-[var(--surface-2)]" strokeWidth="5.5" stroke="currentColor" fill="transparent" r={RADIUS} cx="35" cy="35" />
                           {/* Progressive Filled Track */}
                           <circle
                             className="text-emerald-500 transition-all duration-1000 ease-out fill-transparent"
                             strokeWidth="5.5"
                             strokeDasharray={CIRCUMFERENCE}
                             strokeDashoffset={DASH_OFFSET}
                             strokeLinecap="round"
                             stroke="currentColor"
                             r={RADIUS} cx="35" cy="35"
                           />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pt-[2px]">
                            <span className="text-[19px] font-extrabold tracking-tighter text-[var(--foreground)] leading-none">
                               {reviewSummary.totalAiScore}
                            </span>
                         </div>
                      </div>
                      <div className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase bg-emerald-900/30 px-2.5 py-1 rounded-md shadow-sm border border-emerald-800 mt-1">High Confidence</div>
                   </div>
                </div>

                <p className="text-[13.5px] text-[var(--muted)] leading-relaxed mb-6">
                  The applicant demonstrated exceptional foundational knowledge during the technical walkthrough. However, initial structured communication was lacking in the preamble. Score reflects deep technical depth balanced against minor presentation friction.
                </p>

                <h3 className="text-[11px] font-bold text-[var(--muted)] mb-3 tracking-wide uppercase">Key Timestamps</h3>
                <div className="space-y-2.5 mb-8">
                   <div onClick={() => seekToTime(4)} className="flex gap-3 border border-[var(--border-soft)] rounded-lg p-3 hover:border-[var(--foreground)] transition-colors cursor-pointer">
                      <div className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--foreground)] font-mono text-[10px] font-semibold h-fit mt-0.5">00:04</div>
                      <div>
                        <div className="text-[13px] font-semibold text-[var(--foreground)] tracking-tight">Introduction Section</div>
                         <p className="text-[12px] text-[var(--muted)] mt-1.5 leading-snug">Rambles slightly before getting to the core value proposition.</p>
                      </div>
                   </div>
                   <div onClick={() => seekToTime(50)} className="flex gap-3 border border-[var(--border-soft)] rounded-lg p-3 hover:border-[var(--foreground)] transition-colors cursor-pointer group">
                      <div className="px-1.5 py-0.5 rounded bg-[var(--foreground)] text-[var(--background)] font-mono text-[10px] font-semibold h-fit mt-0.5 transition-transform group-hover:scale-105">00:50</div>
                      <div>
                        <div className="text-[13px] font-semibold text-[var(--foreground)] tracking-tight">Product Walkthrough</div>
                         <p className="text-[12px] text-[var(--muted)] mt-1.5 leading-snug">Executes a flawless technical walkthrough, highlighting primary edge cases.</p>
                      </div>
                   </div>
                </div>

                <h3 className="text-[11px] font-bold text-[var(--muted)] mb-3 tracking-wide uppercase">Per Rubric AI Score</h3>
                <div className="space-y-2 mb-8">
                   {data.rubrics.map(rubric => (
                     <div key={rubric.id} className="flex items-center justify-between text-[13px] border-b border-[var(--border-soft)] pb-2 last:border-0 last:pb-0">
                       <span className="text-[var(--foreground)] font-medium">{rubric.title}</span>
                       <span className="font-mono font-bold text-[var(--foreground)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border-strong)] shadow-sm">{getMockAiScore(rubric.id, rubric.weight)}/{rubric.weight}</span>
                     </div>
                   ))}
                </div>

                <h3 className="text-[11px] font-bold text-[var(--muted)] mb-3 tracking-wide uppercase">Confidence Signal Block</h3>
                <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-xl p-5 shadow-sm">

                   {/* Intuitive Segmented Bar Timeline */}
                   <div className="flex w-full h-[26px] rounded-md overflow-hidden ring-1 ring-black/5 shadow-inner">
                      {/* Segment 1: High */}
                      <div onClick={() => seekToTime(0)} className="bg-emerald-500 w-[20%] border-r border-black/10 hover:brightness-110 transition-colors relative group cursor-pointer" title="00:00 - High Confidence">
                        <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap z-10 shadow-lg pointer-events-none transition-opacity">00:00 Intro</div>
                      </div>
                      {/* Segment 2: Low */}
                      <div onClick={() => seekToTime(45)} className="bg-amber-400 w-[15%] border-r border-black/10 hover:brightness-110 transition-colors relative group cursor-pointer" title="00:45 - Low Confidence">
                         <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap z-10 shadow-lg pointer-events-none transition-opacity">00:45 Struggle</div>
                      </div>
                      {/* Segment 3: High */}
                      <div onClick={() => seekToTime(75)} className="bg-emerald-500 w-[45%] border-r border-black/10 hover:brightness-110 transition-colors relative group cursor-pointer" title="01:15 - High Confidence">
                         <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap z-10 shadow-lg pointer-events-none transition-opacity">01:15 Demo Core</div>
                      </div>
                      {/* Segment 4: Medium */}
                      <div onClick={() => seekToTime(86)} className="bg-emerald-300 w-[20%] hover:brightness-110 transition-colors relative group cursor-pointer" title="01:26 - Medium Confidence">
                         <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap z-10 shadow-lg pointer-events-none transition-opacity">01:26 Conclusion</div>
                      </div>
                   </div>

                   <div className="flex justify-between mt-4 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                     <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm"></span> High Signal</span>
                     <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-sm"></span> Low Signal</span>
                   </div>
                </div>

              </div>
            ) : null}

            {/* 2. HUMAN REVIEW / OVERRIDE SECTION */}
            {activePanel === "review" ? (
              <div className="flex flex-col h-full animate-fade-in-up">
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-[var(--border-soft)]">
                   <div>
                     <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Human Overrides</h2>
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tighter text-[var(--foreground)] leading-none">{reviewSummary.totalScore}</span>
                        <span className="text-xs text-[var(--muted)] font-bold tracking-widest">/100</span>
                      </div>
                   </div>
                </div>

                <p className="text-[12.5px] text-[var(--muted)] mb-6 font-medium bg-[var(--surface-2)] px-3 py-2 rounded-lg border border-[var(--border-soft)]">
                  Scores have been prefilled based on the AI synthesis. You may override them below.
                </p>

                <div className="space-y-4 flex-1">
                  {data.rubrics.map((rubric) => {
                    const noteValue = reviewValues[rubric.id]?.note || "";
                    const isExpanded = !!expandedNotes[rubric.id] || !!noteValue.trim();
                    return (
                       <div key={rubric.id} className="bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-xl p-4 transition-colors focus-within:border-[var(--border-strong)]">
                          <div className="flex items-center justify-between mb-3">
                             <div className="text-[14px] font-semibold text-[var(--foreground)] tracking-tight">{rubric.title}</div>
                             <span className="bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--foreground)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md">
                                Weight: {rubric.weight}%
                             </span>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="range"
                              min={0}
                              max={10}
                              step={1}
                              className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                              value={reviewValues[rubric.id]?.rating || 0}
                              onChange={(e) => setReviewValue(rubric.id, "rating", Number(e.target.value))}
                            />
                            <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] px-2.5 py-1 rounded-md text-[13px] font-mono font-bold w-10 text-center select-none shadow-sm">
                               {reviewValues[rubric.id]?.rating || 0}
                            </div>
                          </div>

                          {/* Note Field */}
                          {isExpanded ? (
                             <textarea
                               className="w-full text-[13px] bg-transparent border-b-2 border-transparent focus:border-[var(--foreground)] outline-none py-1.5 placeholder-[var(--muted)] resize-none bg-[var(--surface-2)] px-2 rounded-t-md mt-1"
                               placeholder="Add reasoning for manual override..."
                               rows={2}
                               value={noteValue}
                               onChange={(e) => setNoteValue(rubric.id, e.target.value)}
                               onBlur={() => {
                                 if (!noteValue.trim()) setExpandedNotes((prev) => ({ ...prev, [rubric.id]: false }));
                               }}
                             />
                          ) : (
                             <button
                               onClick={() => setExpandedNotes((prev) => ({ ...prev, [rubric.id]: true }))}
                               className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-wider flex items-center gap-1 mt-1"
                             >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Add manual reasoning
                             </button>
                          )}
                       </div>
                    );
                  })}
                </div>

                <div className="sticky bottom-[-20px] bg-[var(--surface-1)] pt-4 pb-1 border-t border-[var(--border-soft)] mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
                   <div className="text-[11px] font-semibold tracking-wide uppercase text-[var(--muted)]">
                     {reviewSummary.completed === reviewSummary.total ? (
                       <span className="text-[var(--foreground)] flex items-center gap-1">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                         Ready to Finalize
                       </span>
                     ) : (
                       `${reviewSummary.total - reviewSummary.completed} criteria pending`
                     )}
                   </div>
                   <button
                     className="button-primary h-10 px-5 rounded-lg text-[13px] font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full sm:w-auto shadow-sm"
                     disabled={reviewSummary.completed !== reviewSummary.total || savingReview}
                     onClick={saveReview}
                   >
                     {savingReview ? "Locking..." : "Finalize & Lock Score"}
                   </button>
                </div>
              </div>
            ) : null}

            {/* 3. AI CHAT SECTION */}
            {activePanel === "ai_chat" ? (
              <div className="flex flex-col h-full animate-fade-in-up">
                 <div className="mb-4">
                   <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">AI Assistant</h2>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-soft)] rounded-xl mb-4 bg-[var(--surface-2)]">
                   <svg className="w-8 h-8 text-[var(--border-strong)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                   <p className="text-[13px] font-medium text-[var(--muted)]">Ask the AI questions about the video context.</p>
                 </div>

                 <div className="relative shrink-0">
                    <input
                      disabled
                      placeholder="Ask 'Why did you score Technical Depth low?'"
                      className="w-full input-base px-4 py-3 rounded-xl text-[13.5px] pr-12 cursor-not-allowed opacity-70 shadow-sm"
                    />
                    <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--border-strong)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
            ) : null}

            {/* 4. RUBRIC */}
            {activePanel === "rubric" && (
              <div className="animate-fade-in-up space-y-3">
                 <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Rubric Specs</h2>
                 {data.rubrics.map((rubric) => (
                   <div key={rubric.id} className="bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-lg p-3">
                     <div className="flex items-center justify-between">
                       <div className="font-semibold text-[14px]">{rubric.title}</div>
                       <span className="text-[11px] font-bold text-[var(--muted)] tracking-wider">
                         {rubric.weight}%
                       </span>
                     </div>
                     <div className="text-[12.5px] text-[var(--muted)] mt-1.5 leading-snug">{rubric.description || "No description provided."}</div>
                   </div>
                 ))}
              </div>
            )}

            {/* 5. SUBMITTED FORM */}
            {activePanel === "submitted_form" && (
               <div className="animate-fade-in-up space-y-3">
                 <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Submitted Form</h2>
                 {data.formFields.length === 0 ? <p className="text-[13px] text-[var(--muted)]">No form fields submitted.</p> : null}
                 {data.formFields.map((field, index) => {
                   const key = `${field.label || "field"}-${index}`;
                   const value = data.submittedFields[key];
                   if (field.type === "attachment") {
                     const attachments = data.attachments.filter(
                       (attachment) => attachment.formFieldKey === `attachment_${index}`
                     );
                     return (
                       <div key={key} className="bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-lg p-3">
                         <div className="font-semibold text-[13.5px]">{field.label}</div>
                         <div className="text-[12.5px] text-[var(--muted)] mt-1.5 break-all">
                           {attachments.length > 0 ? (
                             attachments.map((attachment) => (
                               <div key={attachment.id} className="mt-1">
                                 <a href={attachment.url} target="_blank" rel="noreferrer" className="text-[var(--foreground)] underline underline-offset-4 decoration-[var(--border-strong)] hover:decoration-[var(--foreground)] transition-colors">
                                   ↗ {attachment.fileName}
                                 </a>
                               </div>
                             ))
                           ) : (
                             "No attachment provided"
                           )}
                         </div>
                       </div>
                     );
                   }
                   return (
                     <div key={key} className="bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-lg p-3">
                       <div className="font-semibold text-[13.5px]">{field.label}</div>
                       <div className="text-[13px] text-[var(--muted)] mt-1.5">{value || "-"}</div>
                     </div>
                   );
                 })}
               </div>
            )}

            {/* 6. ATTACHMENTS */}
            {activePanel === "attachments" && (
              <div className="animate-fade-in-up space-y-3">
                 <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Attachments</h2>
                 {data.attachments.length === 0 ? (
                   <div className="text-[13px] text-[var(--muted)]">No non-video attachments provided.</div>
                 ) : (
                   data.attachments.map((attachment) => (
                     <div key={attachment.id} className="bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-lg p-3 text-[13px]">
                       <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[var(--foreground)] truncate">{attachment.fileName}</span>
                          <span className="text-[var(--muted)] uppercase text-[10px] tracking-wider font-bold mb-1">{attachment.type} format</span>
                       </div>
                       <div>
                         <a href={attachment.url} target="_blank" rel="noreferrer" className="text-[var(--foreground)] text-[12px] font-medium underline underline-offset-4 decoration-[var(--border-strong)] hover:decoration-[var(--foreground)] transition-colors">
                           Open file ↗
                         </a>
                       </div>
                     </div>
                   ))
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
