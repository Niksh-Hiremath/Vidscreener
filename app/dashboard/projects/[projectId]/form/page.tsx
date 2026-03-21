"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function ensureMandatoryVideoField(fields: FormField[]): FormField[] {
  const normalized: FormField[] = (fields || []).map((field) => ({
    ...field,
    attachmentTypes: field.type === "attachment" ? ((field.attachmentTypes || []) as AttachmentType[]) : undefined,
  }));
  const existingMandatoryIndex = normalized.findIndex(
    (field) => field.type === "attachment" && !!field.required && fieldAcceptsVideo(field)
  );
  if (existingMandatoryIndex === -1) {
    return [MANDATORY_VIDEO_FIELD, ...normalized];
  }
  return normalized.map((field, index) =>
    index === existingMandatoryIndex
      ? { ...field, required: true, attachmentTypes: Array.from(new Set([...(field.attachmentTypes || []), "video"])) as AttachmentType[] }
      : field
  );
}

type ShareRecord = {
  id: number;
  email: string;
  sharedAt: string;
  message: string | null;
  submitted: boolean;
  submissionId: number | null;
  submittedAt: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectFormPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Share panel state
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [sharesLoading, setSharesLoading] = useState(true);
  const [shareEmails, setShareEmails] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [sharing, setSharing] = useState(false);

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

  const loadShares = useCallback(async () => {
    try {
      setSharesLoading(true);
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/shares`, { credentials: "include" });
      const json = await res.json();
      if (res.ok) setShares(json.shares || []);
    } catch {
      /* ignore */
    } finally {
      setSharesLoading(false);
    }
  }, [projectId]);

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
    loadShares();
  }, [projectId, loadShares]);

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
      setTimeout(() => setSuccess(""), 3000); // clear success after 3s
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
        next[index].attachmentTypes = Array.from(
          new Set([...(next[index].attachmentTypes || []), "video"])
        ) as AttachmentType[];
      }
      return next;
    });
  }

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareError("");
    setShareSuccess("");
    setSharing(true);
    try {
      const emails = shareEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter(Boolean);
      if (emails.length === 0) throw new Error("Enter at least one email address.");

      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emails, message: shareMessage || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to share");

      const alreadyMsg = json.alreadyShared?.length ? ` (${json.alreadyShared.length} already shared)` : "";
      setShareSuccess(`Shared with ${json.created} new submitter${json.created !== 1 ? "s" : ""}${alreadyMsg}.`);
      setShareEmails("");
      setShareMessage("");
      loadShares();
      setTimeout(() => setShareSuccess(""), 4000);
    } catch (e: any) {
      setShareError(e.message || "Failed to share");
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
     return <div className="py-20 text-center text-[var(--muted)] text-sm animate-pulse">Loading form structure...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto py-8 lg:py-12">
      {/* Header Area */}
      <header className="mb-12">
        <div className="mb-6">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Project
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Form Builder</h1>
            <p className="mt-2 text-base text-[var(--muted)] max-w-lg leading-relaxed">
              Design the submission structure for this project. Changes apply immediately to new submitter links.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/dashboard/projects/${projectId}/form/test`}
              className="button-secondary h-10 px-4 rounded-lg flex items-center justify-center text-sm font-medium"
              target="_blank"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
            <button
              onClick={saveForm}
              disabled={saving}
              className="button-primary h-10 px-5 rounded-lg flex items-center justify-center text-sm font-medium transition-all w-[120px]"
            >
              {saving ? "Saving..." : "Save Form"}
            </button>
          </div>
        </div>
      </header>

      {error && <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}
      {success && <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{success}</div>}

      <div className="space-y-20">
        {/* Builder Canvas Area */}
        <section className="space-y-6">
          {fieldsWithMandatoryVideo.map((field, index) => {
            const isMandatoryVideo = index === mandatoryVideoIndex;
            return (
              <div
                key={`field-${index}`}
                className={`group relative bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-sm)] transition-all focus-within:ring-2 focus-within:ring-[var(--foreground)] focus-within:border-[var(--foreground)] ${isMandatoryVideo ? 'ring-1 ring-[var(--accent)] ring-opacity-20' : ''}`}
              >
                {/* Visual indicator for mandatory fields */}
                {isMandatoryVideo && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2">
                    <span className="bg-[var(--foreground)] text-[var(--background)] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Mandatory Base
                    </span>
                  </div>
                )}

                {/* Floating Drag Handles */}
                <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-full px-1 py-1 flex gap-1 shadow-sm z-10 w-auto hover:opacity-100">
                  <button
                    onClick={() => moveField(index, "up")}
                    disabled={index === 0}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
                  </button>
                  <button
                    onClick={() => moveField(index, "down")}
                    disabled={index === fieldsWithMandatoryVideo.length - 1}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-0">
                  <div className="flex-1 w-full">
                    <input
                      className="w-full text-lg md:text-xl font-medium bg-transparent border-b-2 border-[var(--border-soft)] focus:border-[var(--foreground)] outline-none py-2 placeholder-[var(--muted)] transition-colors"
                      placeholder="Question Title"
                      value={field.label}
                      onChange={(e) => updateField(index, "label", e.target.value)}
                    />
                  </div>

                  <div className="w-full md:w-[220px] shrink-0">
                    <div className="relative">
                      <select
                        className="input-base w-full appearance-none rounded-xl px-4 py-3 text-sm font-medium capitalize"
                        value={field.type}
                        onChange={(e) => updateField(index, "type", e.target.value)}
                        disabled={isMandatoryVideo}
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--muted)]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachment Type Sub-options */}
                {field.type === "attachment" && (
                  <div className="mt-6 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--muted)] mb-3">
                      Allowed File Formats
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ATTACHMENT_TYPES.map((type) => {
                        const isChecked = (field.attachmentTypes || []).includes(type);
                        const isForcedVideo = isMandatoryVideo && type === "video";
                        return (
                          <button
                            key={type}
                            onClick={() => !isForcedVideo && toggleFieldAttachmentType(index, type)}
                            type="button"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                               isChecked 
                                 ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]" 
                                 : "bg-[var(--surface-1)] border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            } ${isForcedVideo ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {isChecked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            <span className="capitalize">{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-8 pt-5 border-t border-[var(--border-soft)] flex justify-end items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group/toggle">
                    <span className="text-sm font-medium text-[var(--muted)] group-hover/toggle:text-[var(--foreground)] transition-colors">Required</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input 
                        type="checkbox" 
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[var(--surface-2)] appearance-none cursor-pointer transition-transform duration-200 z-10 checked:translate-x-5 checked:border-[var(--foreground)]"
                        style={{ borderTopWidth: '2px', borderBottomWidth: '2px', borderLeftWidth: '2px', borderRightWidth: '2px' }}
                        checked={!!field.required}
                        onChange={(e) => updateField(index, "required", e.target.checked)}
                        disabled={isMandatoryVideo}
                      />
                      <label className={`toggle-label block overflow-hidden h-5 rounded-full ${field.required ? 'bg-[var(--foreground)]' : 'bg-[var(--surface-2)] border border-[var(--border-strong)]'} cursor-pointer`}></label>
                    </div>
                  </label>

                  <div className="w-px h-6 bg-[var(--border-soft)]" />

                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    disabled={isMandatoryVideo}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                      isMandatoryVideo 
                         ? "text-[var(--border-strong)] cursor-not-allowed" 
                         : "text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50"
                    }`}
                    title={isMandatoryVideo ? "Cannot remove base required field" : "Delete question"}
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-center mt-10">
            <button
              onClick={addField}
              type="button"
              className="group flex flex-col items-center gap-2"
            >
              <span className="h-12 w-12 rounded-full border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-sm flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:border-[var(--foreground)] group-hover:scale-105 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </span>
              <span className="text-sm font-medium text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                Add Question
              </span>
            </button>
          </div>
        </section>

        <hr className="border-[var(--border-soft)]" />

        {/* Share Section arranged side-by-side for better rhythm */}
        <section className="scroll-mt-10" id="share-section">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Invite Submitters</h2>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-xl">
              Distribute this form to applicants directly. They will receive access via their applicant portal under "My Applications".
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 lg:gap-12 items-start">
             {/* Left: Email Invites */}
             <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-sm)]">
                <form onSubmit={handleShare} className="space-y-6">
                  <div>
                    <label className="inline-block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                       Recipient Emails <span className="lowercase font-normal ml-1 tracking-normal">(comma-separated)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={shareEmails}
                      onChange={(e) => setShareEmails(e.target.value)}
                      placeholder="alex@example.com, sarah@example.com"
                      className="w-full text-base bg-transparent border-b-2 border-[var(--border-soft)] focus:border-[var(--foreground)] outline-none py-2 placeholder-[var(--muted)] resize-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="inline-block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                      Message (Optional)
                    </label>
                    <input
                      type="text"
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      placeholder="e.g. Please complete your video submission by Friday."
                      className="w-full text-base bg-transparent border-b-2 border-[var(--border-soft)] focus:border-[var(--foreground)] outline-none py-2 placeholder-[var(--muted)] transition-colors"
                    />
                  </div>
                  
                  {shareError && <div className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{shareError}</div>}
                  {shareSuccess && <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{shareSuccess}</div>}
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={sharing}
                      className="button-primary h-11 px-6 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {sharing ? (
                        <>Sending Invites...</>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          Send Invitations
                        </>
                      )}
                    </button>
                  </div>
                </form>
             </div>

             {/* Right: Invited History */}
             <div className="bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-2xl overflow-hidden flex flex-col h-full min-h-[300px]">
                <div className="px-5 py-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-[var(--surface-1)]">
                   <h3 className="text-sm font-semibold text-[var(--foreground)]">
                     Sent Invitations <span className="text-[var(--muted)] font-normal ml-1">({shares.length})</span>
                   </h3>
                   <button onClick={loadShares} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" title="Refresh list">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[400px] scroll-subtle">
                   {sharesLoading ? (
                      <div className="p-6 text-center text-sm text-[var(--muted)] animate-pulse">Loading...</div>
                   ) : shares.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-[var(--surface-1)] border border-[var(--border-strong)] flex items-center justify-center mb-3 text-[var(--muted)]">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                         </div>
                         <p className="text-sm text-[var(--muted)]">No invitations sent yet.</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-[var(--border-soft)]">
                         {shares.map(share => (
                            <div key={share.id} className="p-4 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between gap-3">
                               <div className="min-w-0">
                                  <div className="text-sm font-medium text-[var(--foreground)] truncate pr-2">{share.email}</div>
                                  <div className="text-[11px] text-[var(--muted)] mt-1">Sent {formatDate(share.sharedAt)}</div>
                               </div>
                               <div className="shrink-0">
                                   {share.submitted ? (
                                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        Submitted
                                      </span>
                                   ) : (
                                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--muted)] border border-[var(--border-strong)]">
                                        Pending
                                      </span>
                                   )}
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
