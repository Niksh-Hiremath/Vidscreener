"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { STATUS_COLORS } from '@/lib/constants';

export default function EvaluatorDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
       try {
         const res = await fetch('/api/evaluators/me/assignments');
         if (res.ok) {
           const data = await res.json();
           setAssignments(data.assignments || []);
         }
       } finally {
         setLoading(false);
       }
    }
    fetchAssignments();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      <MainContent>
        <TopNav title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, Evaluator</h2>
            <p className="text-gray-600 mt-1">Here are your pending evaluations</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading assignments...</td>
                   </tr>
                 ) : assignments.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No assignments found.</td>
                   </tr>
                 ) : (
                   assignments.map((assignment) => (
                     <tr key={assignment.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4">
                         <div>
                           <p className="font-medium text-gray-900">{assignment.applicantName}</p>
                           <p className="text-sm text-gray-500">{assignment.applicantId}</p>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-900">{assignment.projectName}</td>
                       <td className="px-6 py-4 text-sm text-gray-900">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[assignment.status] || 'bg-gray-100 text-gray-800'}`}>
                           {assignment.status}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <Link href={`/evaluator/review/${assignment.id}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition">
                           Review
                         </Link>
                       </td>
                     </tr>
                   ))
                 )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Assignments</span>
                <span className="text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h.01M15 15h.01" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Reviews</span>
                <span className="text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">5</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Review Time</span>
                <span className="text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">8.5 <span className="text-lg font-normal text-gray-500">mins</span></p>
            </div>
          </div>

          {/* My Projects */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h3>
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { name: 'Spring 2026 Admissions', reviewed: 32, total: 45, flagged: 3, pending: 2 },
                { name: 'MBA Program 2026', reviewed: 18, total: 20, flagged: 0, pending: 1 },
                { name: 'Fall 2026 Transfer', reviewed: 8, total: 15, flagged: 1, pending: 3 },
              ].map((project, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">{project.name}</h4>
                  
                  {/* Progress Circle */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="56" 
                          stroke="#10b981" 
                          strokeWidth="12" 
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - project.reviewed / project.total)}`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round(project.reviewed / project.total * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 text-center">{project.reviewed}/{project.total} videos reviewed</p>

                  {/* Status Badges */}
                  <div className="flex gap-2 mb-4 justify-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{project.flagged} Flagged</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{project.pending} Pending</span>
                  </div>

                  <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition">
                    Continue Reviewing
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Review Queue */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Queue</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { name: 'John Smith', id: 'APP-2026-1234', duration: '4:32', score: 82, project: 'Spring 2026' },
                    { name: 'Sarah Johnson', id: 'APP-2026-1235', duration: '3:15', score: 76, project: 'Spring 2026' },
                    { name: 'David Lee', id: 'APP-2026-1236', duration: '5:48', score: 68, project: 'Spring 2026' },
                  ].map((video, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{video.name}</p>
                          <p className="text-sm text-gray-500">{video.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{video.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${
                          video.score >= 80 ? 'bg-green-100 text-green-800' :
                          video.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {video.score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{video.project}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition">
                          Start Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
