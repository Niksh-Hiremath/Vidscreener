"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type FormField = {
  label: string;
  type: string;
  required?: boolean;
  attachmentTypes?: string[];
};

const ACCEPT_MAP: Record<string, string> = {
  images: "image/*",
  pdf: "application/pdf,.pdf",
  video: "video/*",
  zip: ".zip,application/zip,application/x-zip-compressed",
};

export default function TestProjectFormPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [attachmentsByField, setAttachmentsByField] = useState<Record<string, FileList | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/form`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to load form");
        setFields(payload.fields || []);
      } catch (e: any) {
        setError(e.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  function setFieldValue(label: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [label]: value }));
  }

  async function submitTestForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("fields", JSON.stringify(fieldValues));
      for (const [fieldKey, files] of Object.entries(attachmentsByField)) {
        if (!files) continue;
        for (const file of Array.from(files)) {
          formData.append(fieldKey, file);
        }
      }

      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/form/test-submit`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Submission failed");
      setSuccess(
        `Submitted successfully. Submission ID: ${payload.submissionId}. Attachments stored: ${payload.attachmentsStored}.`
      );
      setAttachmentsByField({});
    } catch (e: any) {
      setError(e.message || "Submission failed");
    }
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Temporary Test Form</h1>
        <Link href={`/dashboard/projects/${projectId}/form`} className="text-blue-400 underline text-sm">
          Back to Manage Form
        </Link>
      </div>

      {loading ? <div>Loading form config...</div> : null}
      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      {success ? <div className="text-green-400 mb-3">{success}</div> : null}

      {!loading ? (
        <form onSubmit={submitTestForm} className="space-y-3">
          {fields.map((field, index) => {
            const key = `${field.label || "field"}-${index}`;
            const attachmentFieldKey = `attachment_${index}`;
            const attachmentAccept = (field.attachmentTypes || [])
              .map((type) => ACCEPT_MAP[type])
              .filter(Boolean)
              .join(",");
            return (
              <div key={key}>
                <label className="block text-sm mb-1">
                  {field.label || "Untitled"} {field.required ? "*" : ""}
                </label>
                {field.type === "attachment" ? (
                  <div>
                    <input
                      className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
                      type="file"
                      multiple
                      required={!!field.required}
                      accept={attachmentAccept || undefined}
                      onChange={(e) =>
                        setAttachmentsByField((prev) => ({
                          ...prev,
                          [attachmentFieldKey]: e.target.files,
                        }))
                      }
                    />
                    <div className="text-xs text-zinc-400 mt-1">
                      Allowed: {(field.attachmentTypes || []).length ? field.attachmentTypes?.join(", ") : "none"}
                    </div>
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2 min-h-20"
                    required={!!field.required}
                    value={fieldValues[key] || ""}
                    onChange={(e) => setFieldValue(key, e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    required={!!field.required}
                    value={fieldValues[key] || ""}
                    onChange={(e) => setFieldValue(key, e.target.value)}
                  />
                )}
              </div>
            );
          })}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit Test Form
          </button>
        </form>
      ) : null}
    </div>
  );
}
