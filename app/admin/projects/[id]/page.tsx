"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';
import type { Project, RubricCriterion } from '@/lib/types';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data.project);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }
  if (!project) {
    return <div className="flex h-screen items-center justify-center">Project not found.</div>;
  }

  // Type for rubric criteria
  const rubricCriteria: RubricCriterion[] = project.rubric?.criteria || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Projects', href: '/admin/projects' },
          { label: project.name }
        ]} />
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                {project.status === 'active' ? 'Active' : 'Archived'}
              </span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Archive
              </button>
              <Link
                href={`/admin/projects/${project.id}/form`}
                className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium"
              >
                Manage Form
              </Link>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                Edit Project
              </button>
            </div>
          </div>

          {/* Project Info & Stats */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Videos</h3>
              <p className="text-3xl font-bold text-gray-900">{project.videoCount ?? '0'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Evaluators Assigned</h3>
              <p className="text-3xl font-bold text-gray-900">{project.evaluatorCount ?? '0'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completion</h3>
              <p className="text-3xl font-bold text-gray-900">{project.completionPercentage ? `${project.completionPercentage}%` : '-'}</p>
            </div>
          </div>

          {/* Rubric Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Evaluation Rubric</h3>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Edit Rubric
              </button>
            </div>
            <div className="space-y-4">
              {rubricCriteria.length > 0 ? rubricCriteria.map((criterion: RubricCriterion, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                  </div>
                  <div className="flex items-center gap-8 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Weight:</span>{' '}
                      <span className="font-medium text-gray-900">{criterion.weight}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Points:</span>{' '}
                      <span className="font-medium text-gray-900">{criterion.maxPoints}</span>
                    </div>
                  </div>
                </div>
              )) : <div className="text-gray-500">No rubric criteria defined.</div>}
              <div className="pt-4 border-t border-gray-200 flex justify-between text-sm font-medium">
                <span className="text-gray-900">Total Points:</span>
                <span className="text-gray-900">{rubricCriteria.reduce((sum: number, c: RubricCriterion) => sum + (c.maxPoints || 0), 0)}</span>
              </div>
            </div>
          </div>

          {/* Videos Section (placeholder, needs real data) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All Videos →
              </button>
            </div>
            {/* TODO: Replace with real video stats if available */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Approved</span>
                    <span className="text-sm font-medium text-emerald-600">-</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pending Review</span>
                    <span className="text-sm font-medium text-yellow-600">-</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Flagged</span>
                    <span className="text-sm font-medium text-red-600">-</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overridden</span>
                    <span className="text-sm font-medium text-blue-600">-</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluators Section (placeholder, needs real data) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Evaluators</h3>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm">
                + Add Evaluator
              </button>
            </div>
            {/* TODO: Replace with real evaluator data if available */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-gray-500">No evaluator data available.</div>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
