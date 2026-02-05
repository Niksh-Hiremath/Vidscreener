import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function ProjectDetailPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Projects' },
          { label: 'Spring 2026 Admissions' }
        ]} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">Spring 2026 Admissions</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Archive
            </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                Edit Project
              </button>
            </div>
          </div>

          {/* Project Info & Stats */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Videos</h3>
              <p className="text-3xl font-bold text-gray-900">856</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Evaluators Assigned</h3>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completion</h3>
              <p className="text-3xl font-bold text-gray-900">65%</p>
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
              {[
                { name: 'Communication Skills', weight: 30, maxPoints: 30 },
                { name: 'Content Relevance', weight: 25, maxPoints: 25 },
                { name: 'Presentation Quality', weight: 20, maxPoints: 20 },
                { name: 'Creativity', weight: 15, maxPoints: 15 },
                { name: 'Language Proficiency', weight: 10, maxPoints: 10 },
              ].map((criterion, idx) => (
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
              ))}
              <div className="pt-4 border-t border-gray-200 flex justify-between text-sm font-medium">
                <span className="text-gray-900">Total Points:</span>
                <span className="text-gray-900">100</span>
              </div>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All Videos →
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Approved</span>
                    <span className="text-sm font-medium text-emerald-600">560 videos</span>
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
                    <span className="text-sm font-medium text-yellow-600">210 videos</span>
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
                    <span className="text-sm font-medium text-red-600">45 videos</span>
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
                    <span className="text-sm font-medium text-blue-600">41 videos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluators Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Evaluators</h3>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm">
                + Add Evaluator
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Daiwik Chilukuri', reviewed: 45, assigned: 50 },
                { name: 'Sarah Johnson', reviewed: 38, assigned: 40 },
                { name: 'David Lee', reviewed: 52, assigned: 60 },
                { name: 'Emma Wilson', reviewed: 30, assigned: 35 },
              ].map((evaluator, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600">
                        {evaluator.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{evaluator.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{evaluator.reviewed}/{evaluator.assigned}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                        style={{width: `${(evaluator.reviewed / evaluator.assigned) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
