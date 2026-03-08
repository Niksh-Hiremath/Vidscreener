'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubmitterSidebar from '@/components/layout/SubmitterSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { useAuth } from '@/lib/AuthContext';

export default function SubmitterDashboardPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } finally {
        setDataLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  const totalSubmissions = submissions.length;
  const pendingReviews = submissions.filter(s => !s.videos || s.videos.length === 0 || s.videos.some((v: any) => v.status === 'uploaded' || v.status === 'pending')).length;
  const completedReviews = submissions.filter(s => s.videos && s.videos.some((v: any) => v.status === 'ready' || v.status === 'approved' || v.status === 'rejected')).length;

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
        <TopNav title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? 'Welcome back...' : `Welcome back${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}`}
            </h2>
            <p className="text-gray-600 mt-1">Track your submissions and submit new projects</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Submissions</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Review</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{pendingReviews}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Reviewed</span>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{completedReviews}</p>
            </div>
          </div>

          {/* Submit New */}
          <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit a New Project</h3>
                <p className="text-sm text-gray-600 mt-1">Enter the form ID or link provided by the organization</p>
              </div>
              <Link
                href="/submit/new"
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                + New Submission
              </Link>
            </div>
          </div>

          {/* Submissions Table preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
              <Link href="/submit/submissions" className="text-sm font-medium text-pink-600 hover:text-pink-700 transition">
                View all →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading submissions...</td></tr>
                  ) : submissions.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No submissions yet. Click "+ New Submission" to get started.
                    </td></tr>
                  ) : (
                    submissions.slice(0, 5).map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
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
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
