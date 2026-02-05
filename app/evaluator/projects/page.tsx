import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { SAMPLE_PROJECTS } from '@/lib/constants';
import Link from 'next/link';

export default function EvaluatorProjectsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav title="My Projects" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
            <p className="text-gray-600 mt-1">Projects assigned to you for evaluation</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl font-bold text-gray-900">3</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Videos Assigned</div>
              <div className="text-3xl font-bold text-gray-900">45</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Pending Review</div>
              <div className="text-3xl font-bold text-yellow-600">18</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-emerald-600">27</div>
            </div>
          </div>

          {/* Projects List */}
          <div className="grid md:grid-cols-2 gap-6">
            {SAMPLE_PROJECTS.slice(0, 3).map((project, idx) => {
              const assignedVideos = idx === 0 ? 45 : idx === 1 ? 32 : 28;
              const pendingVideos = idx === 0 ? 18 : idx === 1 ? 12 : 8;
              const completedVideos = assignedVideos - pendingVideos;
              const completionRate = Math.round((completedVideos / assignedVideos) * 100);

              return (
                <Link
                  key={project.id}
                  href={`/evaluator/projects/${project.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{assignedVideos}</div>
                      <div className="text-xs text-gray-600 mt-1">Assigned to You</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{pendingVideos}</div>
                      <div className="text-xs text-gray-600 mt-1">Pending Review</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{completedVideos}</div>
                      <div className="text-xs text-gray-600 mt-1">Completed</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Your Progress</span>
                      <span className="text-sm font-semibold text-gray-900">{completionRate}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all"
                        style={{width: `${completionRate}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      {pendingVideos > 0 ? `${pendingVideos} videos waiting for review` : 'All videos reviewed!'}
                    </span>
                    <span className="text-emerald-600 font-medium text-sm flex items-center gap-1">
                      {pendingVideos > 0 ? 'Continue Reviewing' : 'View Details'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeWidth="2" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty State (if no projects) - Hidden for now since we have sample data */}
          {/* <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" strokeWidth="1.5" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Assigned</h3>
            <p className="text-gray-600">You don't have any projects assigned yet. Contact your administrator.</p>
          </div> */}
        </main>
      </MainContent>
    </div>
  );
}
