'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import BarChart from '@/components/charts/BarChart';
import MainContent from '@/components/layout/MainContent';

export default function EvaluatorsPage() {
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvaluators() {
      try {
        const res = await fetch('/api/evaluators');
        if (res.ok) {
          const data = await res.json();
          // Map backend `users` structure to the UI structure
          const formatted = (data.evaluators || []).map((e: any) => ({
            id: e.id,
            name: e.full_name || e.email.split('@')[0],
            email: e.email,
            projects: e.evaluator_assignments?.[0]?.count || 0,
            reviewed: e.human_evaluations?.[0]?.count || 0,
            avgTime: 'N/A', // Compute actual avg time if available in db
            status: e.status || 'active'
          }));
          setEvaluators(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvaluators();
  }, []);

  const totalReviews = evaluators.reduce((acc, e) => acc + (e.reviewed || 0), 0);
  const activeCount = evaluators.filter(e => e.status === 'active').length;

  // Performance chart data
  const performanceData = evaluators.map(e => ({
    name: e.name.split(' ')[0], // First name only for chart
    reviews: e.reviewed
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav title="Evaluators" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Evaluators</h2>
              <p className="text-gray-600 mt-1">Manage your team of video evaluators</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Export Report
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                + Invite Evaluator
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Evaluators</div>
              <div className="text-3xl font-bold text-gray-900">{evaluators.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Reviews</div>
              <div className="text-3xl font-bold text-gray-900">{totalReviews}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Avg Review Time</div>
              <div className="text-3xl font-bold text-gray-900">-<span className="text-lg font-normal text-gray-500"> mins</span></div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search evaluators..."
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>All Projects</option>
                <option>Spring 2026 Admissions</option>
                <option>MBA Program 2026</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {/* Evaluators Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Videos Reviewed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Loading evaluators...</td></tr>
                ) : evaluators.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No evaluators found.</td></tr>
                ) : (
                  evaluators.map((evaluator) => (
                    <tr key={evaluator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-indigo-600">
                              {evaluator.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{evaluator.name}</p>
                            <p className="text-sm text-gray-500">{evaluator.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{evaluator.projects}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{evaluator.reviewed}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{evaluator.avgTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          evaluator.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {evaluator.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Performance Chart */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluator Performance</h3>
            <BarChart 
              data={performanceData} 
              dataKey="reviews" 
              xKey="name"
            />
          </div>
        </main>
      </MainContent>
    </div>
  );
}
