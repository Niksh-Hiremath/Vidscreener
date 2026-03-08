"use client";

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

interface Metric {
  label: string;
  value: number;
  icon: string;
}

const iconBg: Record<string, string> = {
  FolderKanban: 'bg-indigo-100 text-indigo-600',
  FileText: 'bg-purple-100 text-purple-600',
  Video: 'bg-blue-100 text-blue-600',
  CheckCircle: 'bg-emerald-100 text-emerald-600',
  BarChart: 'bg-amber-100 text-amber-600',
  Users: 'bg-cyan-100 text-cyan-600',
  UserCheck: 'bg-green-100 text-green-600',
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics || []);
        }
      } finally {
        setDataLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <MainContent>
        <TopNav title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? 'Welcome back...' : `Welcome back${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}`}
            </h2>
            <p className="text-gray-600 mt-1">Here's what's happening across your organization</p>
          </div>

          {/* Org Secret Key for sharing */}
          {user?.org_secret_key && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">Organization Invite Key</p>
                <p className="text-xs text-indigo-600 mt-1">Share this key with evaluators and submitters so they can join your organization</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-mono text-indigo-800">{user.org_secret_key}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.org_secret_key!);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          {dataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[metric.icon] || 'bg-gray-100 text-gray-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/projects" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Create Project</h3>
              <p className="text-sm text-gray-600 mt-1">Set up a new video evaluation project</p>
            </Link>

            <Link href="/admin/evaluators" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Manage Evaluators</h3>
              <p className="text-sm text-gray-600 mt-1">Invite evaluators and manage assignments</p>
            </Link>

            <Link href="/admin/videos" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">View Videos</h3>
              <p className="text-sm text-gray-600 mt-1">Browse and manage video submissions</p>
            </Link>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
