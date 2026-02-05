import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { SAMPLE_PROJECTS } from '@/lib/constants';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav title="Projects" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 mt-1">Manage all your evaluation projects</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Filter
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                + New Project
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl font-bold text-gray-900">8</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-emerald-600">5</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Videos</div>
              <div className="text-3xl font-bold text-gray-900">2,450</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Evaluators</div>
              <div className="text-3xl font-bold text-gray-900">24</div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_PROJECTS.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Videos</div>
                    <div className="text-xl font-bold text-gray-900">{project.videoCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Evaluators</div>
                    <div className="text-xl font-bold text-gray-900">{project.evaluatorCount}</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-semibold text-gray-900">{project.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{width: `${project.completionPercentage}%`}}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Created {project.createdDate}</span>
                  <span className="text-indigo-600 font-medium">View Details →</span>
                </div>
              </Link>
            ))}

            {/* Add more sample projects */}
            {[
              { name: 'Fall 2026 Transfer', videos: 342, evaluators: 7, completion: 28, status: 'active' },
              { name: 'Engineering Program 2026', videos: 521, evaluators: 9, completion: 85, status: 'active' },
              { name: 'Graduate Studies 2025', videos: 1240, evaluators: 15, completion: 100, status: 'archived' },
            ].map((project, idx) => (
              <div
                key={`extra-${idx}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600">Evaluation project for applicant submissions</p>
                  </div>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Videos</div>
                    <div className="text-xl font-bold text-gray-900">{project.videos}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Evaluators</div>
                    <div className="text-xl font-bold text-gray-900">{project.evaluators}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-semibold text-gray-900">{project.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{width: `${project.completion}%`}}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Created Jan {15 + idx}, 2026</span>
                  <span className="text-indigo-600 font-medium">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </MainContent>
    </div>
  );
}
