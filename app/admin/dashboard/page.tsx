"use client";

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics || []);
        }
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const totalProjects = metrics.find(m => m.label === 'Total Projects')?.value || 0;
  const totalSubmissions = metrics.find(m => m.label === 'Total Submissions')?.value || 0;
  const avgScore = metrics.find(m => m.label === 'Average Score')?.value || 0;
  const completedEval = metrics.find(m => m.label === 'Evaluations Completed')?.value || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <MainContent>
        <TopNav title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to VidScreener</h2>
            <p className="text-gray-600 mt-1">Here's your organization's overview</p>
          </div>

          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-600">Total Projects</span>
                   </div>
                   <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-600">Total Submissions</span>
                   </div>
                   <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-600">Average Score</span>
                     <span className="text-xs text-gray-500">Human evals</span>
                   </div>
                   <p className="text-3xl font-bold text-gray-900">{avgScore}/100</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-600">Evaluations Done</span>
                   </div>
                   <p className="text-3xl font-bold text-gray-900">{completedEval}</p>
                </div>
              </div>
            </>
          )}
        </main>
      </MainContent>
    </div>
  );
}
