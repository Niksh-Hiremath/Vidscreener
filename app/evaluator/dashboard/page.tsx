"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { STATUS_COLORS } from '@/lib/constants';
import { useAuth } from '@/lib/AuthContext';

export default function EvaluatorDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    async function fetchAssignments() {
       try {
         const res = await fetch('/api/evaluators/me/assignments');
         if (res.ok) {
           const data = await res.json();
           setAssignments(data.assignments || []);
         }
       } finally {
         setDataLoading(false);
       }
    }
    fetchAssignments();
  }, []);

  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending' || !a.status).length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;

  // Group assignments by project
  const projectMap = new Map<string, { name: string; total: number; completed: number; pending: number }>();
  for (const a of assignments) {
    const projectId = a.project_id;
    const projectName = a.projects?.name || 'Unknown Project';
    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, { name: projectName, total: 0, completed: 0, pending: 0 });
    }
    const p = projectMap.get(projectId)!;
    p.total++;
    if (a.status === 'completed') p.completed++;
    else p.pending++;
  }
  const projectGroups = Array.from(projectMap.entries());

  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      <MainContent>
        <TopNav title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? 'Welcome back...' : `Welcome back${user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}`}
            </h2>
            <p className="text-gray-600 mt-1">Here are your pending evaluations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Assignments</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalAssignments}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Reviews</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{pendingAssignments}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{completedAssignments}</p>
            </div>
          </div>

          {/* My Projects */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h3>
            {projectGroups.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No projects assigned yet. Contact your administrator.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {projectGroups.map(([projectId, project]) => {
                  const percent = project.total > 0 ? Math.round(project.completed / project.total * 100) : 0;
                  return (
                    <div key={projectId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">{project.name}</h4>
                      
                      {/* Progress Circle */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                            <circle 
                              cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="12" fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percent / 100)}`}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{percent}%</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 text-center">{project.completed}/{project.total} videos reviewed</p>

                      <div className="flex gap-2 mb-4 justify-center">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{project.pending} Pending</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{project.completed} Done</span>
                      </div>

                      <Link
                        href={`/evaluator/queue?project=${projectId}`}
                        className="block w-full text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                      >
                        {project.pending > 0 ? 'Continue Reviewing' : 'View Completed'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Assignments Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Queue</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataLoading ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading assignments...</td></tr>
                  ) : assignments.filter(a => a.status !== 'completed').length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending assignments. Great job!</td></tr>
                  ) : (
                    assignments.filter(a => a.status !== 'completed').map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{assignment.videos?.original_filename || `Video ${assignment.video_id?.substring(0,8)}`}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.projects?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[assignment.status as keyof typeof STATUS_COLORS] || 'bg-yellow-100 text-yellow-800'}`}>
                            {assignment.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/evaluator/review/${assignment.id}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition inline-block">
                            Review
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
