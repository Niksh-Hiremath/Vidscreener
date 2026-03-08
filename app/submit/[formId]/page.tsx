"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SubmissionFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [formConfig, setFormConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  // Map of fieldId -> string value
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchForm() {
      if (formId.startsWith('demo-')) {
        setFormConfig({
          id: formId,
          title: 'Demo Internship Application',
          instructions: 'This is a demo form. Please fill out the details and upload a sample video to see the submission flow.',
          requires_video: true,
          project_id: 'demo-project',
          projects: { organization_id: 'demo-org' },
          form_fields: [
            { id: 'f1', label: 'Why do you want to join?', field_type: 'textarea', is_required: true, order_index: 0 },
            { id: 'f2', label: 'Years of Experience', field_type: 'select', options: ['0-1', '2-5', '5+'], is_required: true, order_index: 1 }
          ]
        });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found or inactive');
        const data = await res.json();
        setFormConfig(data.form);
      } catch (e) {
        alert('Could not load form.');
        router.push('/submit/new');
      } finally {
        setLoading(false);
      }
    }
    if (formId) fetchForm();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;
    
    // Validate video if required
    if (formConfig.requires_video && !videoFile) {
      alert("Please upload a video file.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. If there's a video, get upload URL and upload it directly to MinIO
      let videoRecordResponseId = null;
      let minioKey = null;

      if (videoFile && formConfig.projects?.organization_id) {
        // Get Pre-signed PUT
        const presignRes = await fetch('/api/videos/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: formConfig.projects.organization_id,
            project_id: formConfig.project_id,
            filename: videoFile.name,
          })
        });
        const { uploadUrl, minio_object_key } = await presignRes.json();
        if (!uploadUrl) throw new Error('Failed to get upload URL');

        // Upload to MinIO
        await fetch(uploadUrl, {
          method: 'PUT',
          body: videoFile,
          headers: { 'Content-Type': videoFile.type || 'application/octet-stream' },
        });

        minioKey = minio_object_key;
      }

      // 2. Submit the form responses to create the submission record
      const formattedResponses = Object.keys(responses).map(fieldId => ({
        field_id: fieldId,
        response_text: responses[fieldId]
      }));

      const submitRes = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          responses: formattedResponses,
          // We will link video in step 3
        })
      });
      const { submission } = await submitRes.json();
      if (!submission) throw new Error('Form submission failed');

      // 3. Register the video metadata in DB
      if (minioKey) {
        await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: formConfig.project_id,
            submission_id: submission.id,
            original_filename: videoFile!.name,
            minio_object_key: minioKey,
            mime_type: videoFile!.type,
            size_bytes: videoFile!.size
          })
        });
      }

      router.push(`/submit/${formId}/success?id=${submission.id}`);
    } catch (error: any) {
      alert(`Submission error: ${error.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading form...</div>;
  if (!formConfig) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{formConfig.title}</h1>
        <p className="text-gray-600 mb-8">{formConfig.instructions}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" className="w-full border p-2 rounded" value={submitterName} onChange={e => setSubmitterName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" className="w-full border p-2 rounded" value={submitterEmail} onChange={e => setSubmitterEmail(e.target.value)} />
            </div>
          </div>

          {formConfig.form_fields?.sort((a: any, b: any) => a.order_index - b.order_index).map((field: any) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </label>
              
              {field.field_type === 'textarea' ? (
                <textarea 
                  required={field.is_required} className="w-full border p-2 rounded h-24"
                  value={responses[field.id] || ''} onChange={e => setResponses({...responses, [field.id]: e.target.value})}
                />
              ) : field.field_type === 'select' ? (
                <select 
                  required={field.is_required} className="w-full border p-2 rounded bg-white"
                  value={responses[field.id] || ''} onChange={e => setResponses({...responses, [field.id]: e.target.value})}
                >
                  <option value="">Select an option...</option>
                  {(field.options as string[])?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input 
                  required={field.is_required} type="text" className="w-full border p-2 rounded"
                  value={responses[field.id] || ''} onChange={e => setResponses({...responses, [field.id]: e.target.value})}
                />
              )}
            </div>
          ))}

          {formConfig.requires_video && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
              <label className="block text-sm font-bold text-blue-900 mb-2">Upload Video Submission *</label>
              <input 
                type="file" 
                accept="video/*" 
                required 
                onChange={e => setVideoFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
          )}

          <div className="pt-4 border-t">
            <button 
              type="submit" disabled={submitting}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Uploading & Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
