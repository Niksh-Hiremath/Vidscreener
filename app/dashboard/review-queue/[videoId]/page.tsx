"use client";

import { useEffect, useState } from "react";
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
  const [saveMessage, setSaveMessage] = useState("");

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
        (payload.review?.rubricBreakdown || []).forEach((item: ReviewItem) => {
          seed[item.rubricId] = { rating: item.rating || 0, note: item.note || "" };
        });
        setReviewValues(seed);
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
        rating: prev[rubricId]?.rating || 0,
        note: prev[rubricId]?.note || "",
        [key]: value,
      },
    }));
  }

  async function saveReview() {
    if (!data) return;
    setSaveMessage("");
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
    }
  }

  if (loading) {
    return <div className="rounded border border-zinc-800 bg-zinc-900 p-6">Loading...</div>;
  }

  if (error || !data) {
    return <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-red-400">{error || "Not found"}</div>;
  }

  return (
    <div className="bg-zinc-100 text-zinc-900 rounded border border-zinc-300 p-5 h-[calc(100vh-50px)] overflow-hidden flex flex-col">
      <div className="mb-4 text-sm text-zinc-600">
        <Link href="/dashboard/review-queue" className="text-zinc-700 underline">
          Review Queue
        </Link>{" "}
        / {data.project.name}
      </div>
      <h1 className="text-3xl font-bold mb-1">{data.project.name}</h1>
      <div className="text-zinc-600 mb-4">{data.video.title}</div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="min-h-0 flex flex-col">
          <div className="rounded-xl border border-zinc-300 bg-black p-2 flex-1 min-h-0">
            <video
              className="w-full h-full object-contain rounded-lg"
              src={data.video.playbackUrl}
              controls
              autoPlay
              playsInline
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PANELS.map((panel) => (
              <button
                key={panel.key}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  activePanel === panel.key
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-zinc-300 text-zinc-700"
                }`}
                onClick={() => setActivePanel(panel.key)}
              >
                {panel.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-300 bg-white p-4 min-h-0 overflow-hidden">
          {activePanel === "rubric" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Rubric</h2>
              {data.rubrics.map((rubric) => (
                <div key={rubric.id} className="border border-zinc-200 rounded-lg p-3">
                  <div className="font-semibold">{rubric.title}</div>
                  <div className="text-sm text-zinc-600 mt-1">{rubric.description || "No description"}</div>
                </div>
              ))}
            </div>
          ) : null}

          {activePanel === "submitted_form" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Submitted Form</h2>
              {data.formFields.map((field, index) => {
                const key = `${field.label || "field"}-${index}`;
                const value = data.submittedFields[key];
                if (field.type === "attachment") {
                  const attachments = data.attachments.filter(
                    (attachment) => attachment.formFieldKey === `attachment_${index}`
                  );
                  return (
                    <div key={key} className="border border-zinc-200 rounded-lg p-3">
                      <div className="font-semibold">{field.label}</div>
                      <div className="text-sm text-zinc-600 mt-1">
                        {attachments.length > 0 ? (
                          attachments.map((attachment) => (
                            <div key={attachment.id}>
                              <a href={attachment.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
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
                  <div key={key} className="border border-zinc-200 rounded-lg p-3">
                    <div className="font-semibold">{field.label}</div>
                    <div className="text-sm text-zinc-600 mt-1">{value || "-"}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {activePanel === "attachments" ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Attachments</h2>
              {data.attachments.length === 0 ? (
                <div className="text-zinc-600">No non-video attachments.</div>
              ) : (
                data.attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-zinc-200 rounded-lg p-3 text-sm">
                    <div>Name: {attachment.fileName}</div>
                    <div>Type: {attachment.type}</div>
                    <div>
                      Link:{" "}
                      <a href={attachment.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
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
              <h2 className="text-xl font-semibold">Review</h2>
              {data.rubrics.map((rubric) => (
                <div key={rubric.id} className="border border-zinc-200 rounded-lg p-3 space-y-2">
                  <div className="font-semibold">{rubric.title}</div>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="w-full border border-zinc-300 rounded px-3 py-2"
                    placeholder="Rating (0-10)"
                    value={reviewValues[rubric.id]?.rating || 0}
                    onChange={(e) => setReviewValue(rubric.id, "rating", Number(e.target.value))}
                  />
                  <input
                    type="text"
                    className="w-full border border-zinc-300 rounded px-3 py-2"
                    placeholder="1-line reason (optional)"
                    value={reviewValues[rubric.id]?.note || ""}
                    onChange={(e) => setReviewValue(rubric.id, "note", e.target.value)}
                  />
                </div>
              ))}
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveReview}>
                Save Review
              </button>
              {saveMessage ? <div className="text-sm text-zinc-600">{saveMessage}</div> : null}
            </div>
          ) : null}

          {activePanel === "ai_review" ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Review</h2>
              <div className="text-zinc-600">AI review placeholder. Backend AI endpoint will be integrated later.</div>
            </div>
          ) : null}

          {activePanel === "ai_chat" ? (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
              <div className="text-zinc-600 mb-4">
                AI chat placeholder. You will be able to ask why AI rated this way.
              </div>
              <div className="mt-auto border border-zinc-300 rounded-lg p-3 text-zinc-500">
                Type your question here... (coming soon)
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
