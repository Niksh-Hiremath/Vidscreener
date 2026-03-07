"use client";

import { useEffect, useState } from 'react';
import ProjectForm from './form';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';



export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]); // TODO: Replace any with Project[] if type is available
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(data: { name: string; description: string }) {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowForm(false);
        await fetchProjects();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to create project');
      }
    } catch {
      setError('Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <MainContent>
        <TopNav title="Projects" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 mt-1">Manage all your evaluation projects</p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                onClick={() => setShowForm(true)}
              >
                + New Project
              </button>
            </div>
                    {showForm && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                          <h3 className="text-lg font-bold mb-4">Create New Project</h3>
                          <ProjectForm
                            onSubmit={handleCreateProject}
                            onCancel={() => { setShowForm(false); setError(null); }}
                            loading={creating}
                          />
                          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                        </div>
                      </div>
                    )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-emerald-600">{projects.filter(p => p.status === 'active').length}</div>
            </div>
          </div>

          {loading ? (
             <div className="text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
             <div className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-200 mt-4">
               No projects yet. Create one to get started!
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link href={`/admin/projects/${project.id}`} key={project.id} className="block">
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      </div>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {project.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Submissions</div>
                        <div className="text-xl font-bold text-gray-900">{project.submissions?.[0]?.count || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Evaluators</div>
                        <div className="text-xl font-bold text-gray-900">{project.evaluator_assignments?.[0]?.count || 0}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col text-xs text-gray-500 space-y-2">
                      <p>Created {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </MainContent>
    </div>
  );
}
