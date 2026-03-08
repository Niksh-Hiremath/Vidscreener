"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function StatusCheckPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) throw new Error('Submission not found');
        const data = await res.json();
        setSubmission(data.submission);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (submissionId) fetchStatus();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading submission status...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Submission not found'}</p>
          <Link href="/submit/dashboard" className="text-pink-600 hover:text-pink-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const video = submission.videos?.[0];
  const videoStatus = video?.status || 'pending';
  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Video Uploaded', done: !!video },
    { label: 'Under Review', done: videoStatus === 'processing' || videoStatus === 'ready' },
    { label: 'Evaluated', done: videoStatus === 'ready' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Status</h2>
          <p className="text-sm text-gray-500 mb-6">
            Project: <span className="font-medium text-gray-700">{submission.projects?.name || 'N/A'}</span>
          </p>

          {/* Status Pipeline */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs mt-2 text-gray-600 text-center">{step.label}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-full h-1 mx-2 rounded ${step.done ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Submitter</p>
                <p className="font-medium text-gray-900">{submission.submitter_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{submission.submitter_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted At</p>
                <p className="font-medium text-gray-900">{new Date(submission.submitted_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  videoStatus === 'ready' ? 'bg-green-100 text-green-800' :
                  videoStatus === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {videoStatus === 'ready' ? 'Evaluated' :
                   videoStatus === 'uploaded' ? 'Under Review' :
                   'Pending'}
                </span>
              </div>
            </div>

            {video && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Video File</p>
                <p className="font-medium text-gray-900">{video.original_filename}</p>
              </div>
            )}

            {/* Form Responses */}
            {submission.submission_responses && submission.submission_responses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Form Responses</h4>
                <div className="space-y-2">
                  {submission.submission_responses.map((response: any) => (
                    <div key={response.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{response.form_fields?.label || 'Field'}</p>
                      <p className="text-sm text-gray-900">{response.response_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/submit/dashboard" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
