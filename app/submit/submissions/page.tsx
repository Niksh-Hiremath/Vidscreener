'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubmitterSidebar from '@/components/layout/SubmitterSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { useAuth } from '@/lib/AuthContext';

export default function SubmitterSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-green-100 text-green-800',
    ready: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    submitted: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SubmitterSidebar />
      <MainContent>
        <TopNav title="My Submissions" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                All Submissions
              </h2>
              <p className="text-gray-600 mt-1">View and track all your project submissions</p>
            </div>
            <Link
              href="/submit/new"
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition shadow-sm"
            >
              + New Submission
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading submissions...</td></tr>
                ) : submissions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900">No submissions yet</p>
                    <p className="mt-1">Click "+ New Submission" to get started.</p>
                  </td></tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{sub.projects?.name || 'Unknown Project'}</p>
                        <p className="text-xs text-gray-500">{sub.submission_forms?.title || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {sub.videos && sub.videos.length > 0
                          ? sub.videos[0].original_filename || `Video ${sub.videos[0].id.substring(0,8)}`
                          : 'No video'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          sub.videos && sub.videos.length > 0
                            ? (statusColor[sub.videos[0].status] || 'bg-gray-100 text-gray-800')
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.videos && sub.videos.length > 0 ? sub.videos[0].status : 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/submit/status/${sub.id}`} className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
