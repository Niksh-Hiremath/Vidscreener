'use client';

import { useEffect, useState } from 'react';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';

export default function ReviewQueuePage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const res = await fetch('/api/evaluators/me/assignments');
        if (res.ok) {
          const data = await res.json();
          // Sort by due date or status to simulate "priority"
          const pending = (data.assignments || []).filter((a: any) => a.status === 'pending');
          setAssignments(pending);
        }
      } catch (e) {
        console.error('Error fetching assignments:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav title="Review Queue" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
              <p className="text-gray-600 mt-1">Videos waiting for your review across all projects</p>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>Sort by: Priority</option>
                <option>Sort by: Upload Date</option>
                <option>Sort by: AI Score</option>
              </select>
            </div>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Pending</div>
              <div className="text-3xl font-bold text-gray-900">{assignments.length}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
              All Pending ({assignments.length})
            </button>
          </div>

          {loading ? (
             <div className="text-gray-500">Loading queue...</div>
          ) : assignments.length === 0 ? (
             <div className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-200 mt-4">
               No pending videos to review!
             </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="m22 8-6 4 6 4V8Z" />
                              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Video ID: {assignment.video_id.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.projects?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.videos?.original_filename || 'video.mp4'}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/evaluator/review/${assignment.id}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg inline-block"
                        >
                          Start Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </MainContent>
    </div>
  );
}
