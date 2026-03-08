"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';
import type { Project, RubricCriterion } from '@/lib/types';

interface AssignedEvaluator {
  evaluator_id: string;
  evaluator_name: string;
  total: number;
  pending: number;
  completed: number;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedEvaluators, setAssignedEvaluators] = useState<AssignedEvaluator[]>([]);
  const [allEvaluators, setAllEvaluators] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

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

  // Fetch evaluators list for this org
  useEffect(() => {
    async function fetchEvaluators() {
      try {
        const res = await fetch('/api/evaluators');
        if (res.ok) {
          const data = await res.json();
          setAllEvaluators(data.evaluators || []);
        }
      } catch { }
    }
    fetchEvaluators();
  }, []);

  // Fetch videos for this project
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          const data = await res.json();
          const projectVideos = (data.videos || []).filter((v: any) => v.project_id === id);
          setVideos(projectVideos);
        }
      } catch { }
    }
    if (id) fetchVideos();
  }, [id]);

  // Compute assigned evaluators from evaluator data
  useEffect(() => {
    async function computeAssignedEvaluators() {
      if (!allEvaluators || !id) return;

      const evaluatorsWithAssignments: AssignedEvaluator[] = [];
      for (const evaluator of allEvaluators) {
        try {
          const res = await fetch(`/api/evaluators/${evaluator.id}/assignments`);
          if (res.ok) {
            const data = await res.json();
            const projectAssignments = (data.assignments || []).filter((a: any) => a.project_id === id);
            if (projectAssignments.length > 0) {
              evaluatorsWithAssignments.push({
                evaluator_id: evaluator.id,
                evaluator_name: evaluator.full_name,
                total: projectAssignments.length,
                pending: projectAssignments.filter((a: any) => a.status === 'pending').length,
                completed: projectAssignments.filter((a: any) => a.status === 'completed').length,
              });
            }
          }
        } catch { }
      }
      setAssignedEvaluators(evaluatorsWithAssignments);
    }
    computeAssignedEvaluators();
  }, [allEvaluators, id]);

  async function handleAssignEvaluator() {
    if (!selectedEvaluatorId || !id) return;
    setAssigning(true);
    try {
      // Get unassigned videos for this evaluator in this project
      const assignedRes = await fetch(`/api/evaluators/${selectedEvaluatorId}/assignments`);
      const assignedData = await assignedRes.json();
      const alreadyAssignedVideoIds = new Set(
        (assignedData.assignments || [])
          .filter((a: any) => a.project_id === id)
          .map((a: any) => a.video_id)
      );

      const unassignedVideos = videos.filter(v => !alreadyAssignedVideoIds.has(v.id));

      if (unassignedVideos.length === 0) {
        alert('All videos in this project are already assigned to this evaluator.');
        setAssigning(false);
        return;
      }

      const res = await fetch(`/api/evaluators/${selectedEvaluatorId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_ids: unassignedVideos.map((v: any) => v.id),
          project_id: id,
        }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedEvaluatorId('');
        // Re-fetch evaluator assignments
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }
  if (!project) {
    return <div className="flex h-screen items-center justify-center">Project not found.</div>;
  }

  const rubricCriteria: RubricCriterion[] = project.rubric?.criteria || [];

  // Compute real video stats
  const totalVideos = videos.length;
  const uploadedVideos = videos.filter(v => v.status === 'uploaded').length;
  const readyVideos = videos.filter(v => v.status === 'ready').length;
  const flaggedVideos = videos.filter(v => v.status === 'flagged').length;

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
              <Link
                href={`/admin/projects/${project.id}/form`}
                className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium"
              >
                Manage Form
              </Link>
            </div>
          </div>

          {/* Project Info & Stats */}
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Videos</h3>
              <p className="text-3xl font-bold text-gray-900">{totalVideos}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Evaluators Assigned</h3>
              <p className="text-3xl font-bold text-gray-900">{assignedEvaluators.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Review</h3>
              <p className="text-3xl font-bold text-yellow-600">{uploadedVideos}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Evaluated</h3>
              <p className="text-3xl font-bold text-emerald-600">{readyVideos}</p>
            </div>
          </div>

          {/* Rubric Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Evaluation Rubric</h3>
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
              {rubricCriteria.length > 0 && (
                <div className="pt-4 border-t border-gray-200 flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total Points:</span>
                  <span className="text-gray-900">{rubricCriteria.reduce((sum: number, c: RubricCriterion) => sum + (c.maxPoints || 0), 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Videos ({totalVideos})</h3>
              <Link href="/admin/videos" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All Videos →
              </Link>
            </div>
            {totalVideos > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Evaluated</span>
                      <span className="text-sm font-medium text-emerald-600">{readyVideos}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${totalVideos > 0 ? (readyVideos / totalVideos * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pending Review</span>
                      <span className="text-sm font-medium text-yellow-600">{uploadedVideos}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${totalVideos > 0 ? (uploadedVideos / totalVideos * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
                {flaggedVideos > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Flagged</span>
                        <span className="text-sm font-medium text-red-600">{flaggedVideos}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: `${totalVideos > 0 ? (flaggedVideos / totalVideos * 100) : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No videos submitted yet.</p>
            )}
          </div>

          {/* Assigned Evaluators Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Evaluators</h3>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm"
              >
                + Add Evaluator
              </button>
            </div>
            {assignedEvaluators.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedEvaluators.map(e => (
                  <div key={e.evaluator_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">
                          {e.evaluator_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{e.evaluator_name}</p>
                        <p className="text-xs text-gray-500">{e.total} videos assigned</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">{e.pending} pending</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">{e.completed} done</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${e.total > 0 ? (e.completed / e.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No evaluators assigned to this project yet. Click "+ Add Evaluator" to assign.</div>
            )}
          </div>

          {/* Assign Evaluator Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
              <div className="bg-white border border-gray-400 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Evaluator to Project</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select an evaluator to assign all unassigned videos in this project.
                </p>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedEvaluatorId}
                  onChange={e => setSelectedEvaluatorId(e.target.value)}
                >
                  <option value="">Select an evaluator...</option>
                  {allEvaluators.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.full_name} ({ev.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mb-4">
                  {videos.length} video(s) in this project. Evaluators will be assigned all unassigned videos.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setShowAssignModal(false); setSelectedEvaluatorId(''); }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignEvaluator}
                    disabled={!selectedEvaluatorId || assigning}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </MainContent>
    </div>
  );
}
