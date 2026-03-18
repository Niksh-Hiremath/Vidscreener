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
  attachmentTypes?: AttachmentType[];
};

const FIELD_TYPES = ["text", "textarea", "number", "date", "attachment"];
const ATTACHMENT_TYPES = ["images", "pdf", "video", "zip"] as const;
type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export default function ProjectFormPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);

  const [fields, setFields] = useState<FormField[]>([]);
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

  async function saveForm() {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/projects/${projectId}/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fields }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save form");
      setSuccess("Form saved.");
    } catch (e: any) {
      setError(e.message || "Failed to save form");
    }
  }

  function toggleFieldAttachmentType(index: number, type: AttachmentType) {
    setFields((prev) => {
      const next = [...prev];
      const current = next[index]?.attachmentTypes || [];
      const hasType = current.includes(type);
      next[index] = {
        ...next[index],
        attachmentTypes: hasType
          ? current.filter((value) => value !== type)
          : [...current, type],
      };
      return next;
    });
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Manage Submitter Form</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-400 underline text-sm">
          Back to Project
        </Link>
      </div>

      {loading ? <div>Loading...</div> : null}
      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      {success ? <div className="text-green-400 mb-3">{success}</div> : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={`field-${index}`} className="rounded border border-zinc-700 bg-zinc-800 p-3 space-y-2">
            <input
              className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
              placeholder="Field label"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />
            <select
              className="w-full border border-zinc-700 bg-zinc-900 rounded px-3 py-2"
              value={field.type}
              onChange={(e) => updateField(index, "type", e.target.value)}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label className="text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={!!field.required}
                onChange={(e) => updateField(index, "required", e.target.checked)}
              />
              Required
            </label>

            {field.type === "attachment" ? (
              <div>
                <div className="text-sm mb-2">Allowed file types for this field</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ATTACHMENT_TYPES.map((type) => (
                    <label key={type} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={(field.attachmentTypes || []).includes(type)}
                        onChange={() => toggleFieldAttachmentType(index, type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => removeField(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="bg-zinc-700 text-white px-3 py-2 rounded" onClick={addField}>
          Add Field
        </button>
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={saveForm}>
          Save Form
        </button>
        <Link
          href={`/dashboard/projects/${projectId}/form/test`}
          className="bg-emerald-600 text-white px-3 py-2 rounded"
        >
          Open Test Form
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        {fields.length === 0 ? (
          <div className="text-zinc-400">No fields added.</div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={`preview-${index}`} className="rounded border border-zinc-700 bg-zinc-800 p-3">
                <div className="font-semibold">{field.label || "Untitled field"}</div>
                <div className="text-sm text-zinc-400">
                  {field.type}{field.required ? " • Required" : ""}
                  {field.type === "attachment" && (field.attachmentTypes || []).length > 0
                    ? ` • ${field.attachmentTypes?.join(", ")}`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
