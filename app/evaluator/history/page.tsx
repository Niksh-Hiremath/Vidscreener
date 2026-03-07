'use client';

import { useEffect, useState } from 'react';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';

export default function ReviewHistoryPage() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/evaluators/me/assignments');
        if (res.ok) {
          const data = await res.json();
          const completed = (data.assignments || []).filter((a: any) => a.status === 'completed');
          setHistoryItems(completed);
        }
      } catch (e) {
        console.error('Error fetching history:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav title="Review History" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review History</h2>
              <p className="text-gray-600 mt-1">Your past video reviews and decisions</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Reviewed</div>
              <div className="text-3xl font-bold text-gray-900">{historyItems.length}</div>
            </div>
          </div>

          {/* History Table */}
          {loading ? (
             <div className="text-gray-500">Loading history...</div>
          ) : historyItems.length === 0 ? (
             <div className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-200 mt-4">
               You haven't completed any reviews yet.
             </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant Video ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historyItems.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="m22 8-6 4 6 4V8Z" />
                              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">ID: {review.video_id?.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{review.projects?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(review.updated_at || review.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link href={`/evaluator/review/${review.id}`} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          View Details
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
