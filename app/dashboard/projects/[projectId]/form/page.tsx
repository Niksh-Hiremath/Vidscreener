"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type FormField = {
  label: string;
  type: string;
  required?: boolean;
  attachmentTypes?: AttachmentType[];
};

const FIELD_TYPES = ["text", "textarea", "number", "date", "attachment"];
const ATTACHMENT_TYPES = ["images", "pdf", "video", "zip"] as const;
type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

const MANDATORY_VIDEO_LABEL = "Video Submission";
const MANDATORY_VIDEO_FIELD: FormField = {
  label: MANDATORY_VIDEO_LABEL,
  type: "attachment",
  required: true,
  attachmentTypes: ["video"],
};

function fieldAcceptsVideo(field: FormField) {
  return field.type === "attachment" && (field.attachmentTypes || []).includes("video");
}

function ensureMandatoryVideoField(fields: FormField[]) {
  const normalized = (fields || []).map((field) => ({
    ...field,
    attachmentTypes: field.type === "attachment" ? (field.attachmentTypes || []) : undefined,
  }));
  const existingMandatoryIndex = normalized.findIndex(
    (field) => field.type === "attachment" && !!field.required && fieldAcceptsVideo(field)
  );
  if (existingMandatoryIndex === -1) {
    return [MANDATORY_VIDEO_FIELD, ...normalized];
  }

  return normalized.map((field, index) =>
    index === existingMandatoryIndex
      ? {
          ...field,
          required: true,
          attachmentTypes: Array.from(new Set([...(field.attachmentTypes || []), "video"])),
        }
      : field
  );
}

export default function ProjectFormPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldsWithMandatoryVideo = useMemo(() => ensureMandatoryVideoField(fields), [fields]);
  const mandatoryVideoIndex = useMemo(
    () =>
      fieldsWithMandatoryVideo.findIndex(
        (field) => field.type === "attachment" && !!field.required && fieldAcceptsVideo(field)
      ),
    [fieldsWithMandatoryVideo]
  );
  const requiredCount = useMemo(
    () => fieldsWithMandatoryVideo.filter((field) => !!field.required).length,
    [fieldsWithMandatoryVideo]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/form`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load form");
        setFields(ensureMandatoryVideoField(payload.fields || []));
      } catch (e: any) {
        setError(e.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  function updateField(index: number, key: keyof FormField, value: string | boolean) {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function addField() {
    setFields((prev) => [...prev, { label: "", type: "text", required: false }]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, idx) => idx !== index));
  }

  function moveField(index: number, direction: "up" | "down") {
    setFields((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function saveForm() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payloadFields = ensureMandatoryVideoField(fields);
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fields: payloadFields }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save form");
      setFields(payload.fields || payloadFields);
      setSuccess("Form saved.");
    } catch (e: any) {
      setError(e.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  function toggleFieldAttachmentType(index: number, type: AttachmentType) {
    setFields((prev) => {
      const next = [...prev];
      const current = next[index]?.attachmentTypes || [];
      const hasType = current.includes(type);
      const isMandatoryField = index === mandatoryVideoIndex;
      if (isMandatoryField && type === "video") return prev;
      next[index] = {
        ...next[index],
        attachmentTypes: hasType ? current.filter((value) => value !== type) : [...current, type],
      };
      if (isMandatoryField) {
        next[index].attachmentTypes = Array.from(new Set([...(next[index].attachmentTypes || []), "video"]));
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-6 md:p-7 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Submitter Form</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:from-indigo-100"
        >
          Back to Project
        </Link>
      </section>

      <section className="surface-card rounded-2xl p-6">
        {loading ? <div className="text-sm text-muted">Loading...</div> : null}
        {error ? <div className="text-sm text-rose-600 mb-3">{error}</div> : null}
        {success ? <div className="text-sm text-emerald-600 mb-3">{success}</div> : null}

        <div className="surface-muted rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-muted">Questions</div>
              <div className="text-2xl font-semibold mt-1">{fieldsWithMandatoryVideo.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Required</div>
              <div className="text-2xl font-semibold mt-1">{requiredCount}</div>
            </div>
            <div className="col-span-2 md:col-span-2">
              <div className="text-xs text-muted">Mandatory Rule</div>
              <div className="text-sm font-medium mt-1">Every form must collect at least one required video.</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {fieldsWithMandatoryVideo.map((field, index) => {
            const isMandatoryVideo = index === mandatoryVideoIndex;
            return (
              <div key={`field-${index}`} className="surface-muted rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Question {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                      aria-label="Move question up"
                      title="Move up"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                      onClick={() => moveField(index, "down")}
                      disabled={index === fieldsWithMandatoryVideo.length - 1}
                      aria-label="Move question down"
                      title="Move down"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isMandatoryVideo ? (
                      <span className="rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1">
                        Mandatory Video
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        isMandatoryVideo
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                      onClick={() => removeField(index)}
                      disabled={isMandatoryVideo}
                      aria-label="Remove question"
                      title={isMandatoryVideo ? "This question is required" : "Remove question"}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_170px_120px] gap-3">
                  <input
                    className="input-base focus-ring w-full rounded-xl px-3 py-2"
                    placeholder="Question title"
                    value={field.label}
                    onChange={(e) => updateField(index, "label", e.target.value)}
                  />
                  <select
                    className="input-base focus-ring w-full rounded-xl px-3 py-2"
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    disabled={isMandatoryVideo}
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="input-base rounded-xl px-3 py-2 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!field.required}
                      onChange={(e) => updateField(index, "required", e.target.checked)}
                      disabled={isMandatoryVideo}
                    />
                    Required
                  </label>
                </div>

                {field.type === "attachment" ? (
                  <div className="mt-3">
                    <div className="text-xs text-muted mb-2">Allowed attachment types</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {ATTACHMENT_TYPES.map((type) => (
                        <label
                          key={type}
                          className={`rounded-lg px-2.5 py-1.5 text-xs border ${
                            (field.attachmentTypes || []).includes(type)
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-white border-[var(--border-soft)] text-slate-600"
                          } ${isMandatoryVideo && type === "video" ? "font-semibold" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="mr-1"
                            checked={(field.attachmentTypes || []).includes(type)}
                            onChange={() => toggleFieldAttachmentType(index, type)}
                            disabled={isMandatoryVideo && type === "video"}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="button-secondary rounded-xl px-3 py-2 text-sm" onClick={addField} type="button">
            Add Question
          </button>
          <button className="button-primary rounded-xl px-3 py-2 text-sm" onClick={saveForm} disabled={saving} type="button">
            {saving ? "Saving..." : "Save Form"}
          </button>
          <Link href={`/dashboard/projects/${projectId}/form/test`} className="button-secondary rounded-xl px-3 py-2 text-sm">
            Open Test Form
          </Link>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          {fieldsWithMandatoryVideo.length === 0 ? (
            <div className="text-sm text-muted">No fields added.</div>
          ) : (
            <div className="space-y-2.5">
              {fieldsWithMandatoryVideo.map((field, index) => (
                <div key={`preview-${index}`} className="surface-muted rounded-xl p-3">
                  <div className="text-xs text-slate-500 mb-1">Question {index + 1}</div>
                  <div className="font-semibold">{field.label || "Untitled field"}</div>
                  <div className="text-xs text-muted mt-1">
                    {field.type}
                    {field.required ? " • Required" : ""}
                    {field.type === "attachment" && (field.attachmentTypes || []).length > 0
                      ? ` • ${field.attachmentTypes?.join(", ")}`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
