"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_WORKER_API_BASE_URL || "http://localhost:8787";

type FormField = {
  label: string;
  type: string;
  required: boolean;
  attachmentTypes?: string[];
};

type ExistingSubmission = { id: number; submittedAt: string };

type FormData = {
  project: { id: number; name: string; description: string | null; status: string };
  organization: { id: number; name: string } | null;
  fields: FormField[];
  existingSubmission: ExistingSubmission | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function FillApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [data, setData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fileValues, setFileValues] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!projectId) return;
    fetch(`${API}/api/submitter/projects/${projectId}/form`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      const fieldsPayload: Record<string, string> = {};
      data.fields.forEach((field, idx) => {
        if (field.type !== "attachment") {
          fieldsPayload[`field_${idx}`] = fieldValues[`field_${idx}`] || "";
        }
      });
      formData.append("fields", JSON.stringify(fieldsPayload));

      data.fields.forEach((field, idx) => {
        if (field.type === "attachment") {
          const files = fileValues[`attachment_${idx}`] || [];
          for (const file of files) {
            formData.append(`attachment_${idx}`, file);
          }
        }
      });

      const res = await fetch(`${API}/api/submitter/projects/${projectId}/submit`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSubmitSuccess(true);
      setTimeout(() => router.push("/dashboard/submitter/applications"), 2000);
    } catch (e: any) {
      setSubmitError(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { project, organization, fields, existingSubmission } = data;

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="surface-card rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-emerald-900/30 flex items-center justify-center">
            <svg className="h-7 w-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Application Submitted!</h2>
          <p className="text-sm text-muted">Your application for <span className="font-medium text-[var(--color-text)]">{project.name}</span> has been received. Redirecting you to My Applications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="rounded-2xl p-6 md:p-7">
        <div className="flex items-center gap-2 text-xs text-muted mb-3">
          <button onClick={() => router.back()} className="hover:text-[var(--color-text)] transition-colors">← Back</button>
          {organization && (
            <>
              <span>/</span>
              <span>{organization.name}</span>
            </>
          )}
        </div>
        <p className="text-xs uppercase tracking-wide text-[var(--color-primary)] font-semibold mb-2">Application Form</p>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">{project.name}</h1>
        {project.description && (
          <p className="text-sm text-muted mt-2">{project.description}</p>
        )}
      </section>

      {/* Already submitted */}
      {existingSubmission && (
        <div className="surface-card rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Application already submitted</h3>
              <p className="text-sm text-muted mt-0.5">
                You submitted this application on {formatDate(existingSubmission.submittedAt)}. Your submission is being processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {!existingSubmission && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field, idx) => (
            <div key={idx} className="surface-card rounded-2xl p-6">
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">
                {field.label}
                {field.required && <span className="text-[var(--color-primary)] ml-1">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  value={fieldValues[`field_${idx}`] || ""}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [`field_${idx}`]: e.target.value }))}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  className="input-base w-full rounded-xl px-3 py-2.5 text-sm mt-1"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  required={field.required}
                  rows={4}
                  value={fieldValues[`field_${idx}`] || ""}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [`field_${idx}`]: e.target.value }))}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  className="input-base w-full rounded-xl px-3 py-2.5 text-sm mt-1 resize-none"
                />
              )}

              {field.type === "attachment" && (
                <div className="mt-2">
                  <div className="text-[11px] text-muted mb-2 flex flex-wrap gap-1">
                    Accepted:
                    {(field.attachmentTypes || []).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] font-medium capitalize">{t}</span>
                    ))}
                  </div>

                  <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-strong)] rounded-xl cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--glow-primary-subtle)] transition-colors group"
                    htmlFor={`file-${idx}`}
                  >
                    <svg className="h-6 w-6 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">Click to upload files</span>
                    <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5">or drag and drop here</span>
                    <input
                      id={`file-${idx}`}
                      type="file"
                      multiple
                      required={field.required && !(fileValues[`attachment_${idx}`]?.length)}
                      accept={getAcceptString(field.attachmentTypes || [])}
                      className="hidden"
                      ref={(el) => { fileRefs.current[`attachment_${idx}`] = el; }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFileValues((prev) => ({ ...prev, [`attachment_${idx}`]: files }));
                      }}
                    />
                  </label>

                  {(fileValues[`attachment_${idx}`] || []).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {(fileValues[`attachment_${idx}`] || []).map((file, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] bg-[var(--surface-2)] rounded-lg px-3 py-2">
                          <svg className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                          </svg>
                          <span className="truncate">{file.name}</span>
                          <span className="text-[var(--color-text-muted)] shrink-0">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}

          {submitError && (
            <div className="rounded-xl bg-rose-900/30 border border-rose-800 px-4 py-3 text-sm text-rose-400">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="button-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Submitting…
              </span>
            ) : "Submit Application"}
          </button>
        </form>
      )}
    </div>
  );
}

function getAcceptString(types: string[]): string {
  const map: Record<string, string> = {
    images: "image/*",
    pdf: "application/pdf",
    video: "video/*",
    zip: ".zip,application/zip",
  };
  return types.map((t) => map[t] || "*").join(",");
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="rounded-2xl p-7">
        <div className="h-3 bg-[var(--surface-2)] rounded w-24 mb-3" />
        <div className="h-7 bg-[var(--surface-2)] rounded w-2/3 mb-2" />
        <div className="h-3 bg-[var(--surface-2)] rounded w-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="surface-card rounded-2xl p-6">
          <div className="h-4 bg-[var(--surface-2)] rounded w-1/4 mb-3" />
          <div className="h-10 bg-[var(--surface-2)] rounded w-full" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="surface-card rounded-2xl p-10 text-center">
        <p className="text-sm text-[var(--color-primary)]">{message}</p>
      </div>
    </div>
  );
}
