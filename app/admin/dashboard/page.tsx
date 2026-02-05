import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, Niksh Hiremath</h2>
            <p className="text-gray-600 mt-1">Here's what's happening today</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Videos</span>
                <span className="text-xs text-green-600 font-medium">+12%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">2,450</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Reviews</span>
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
              </div>
              <p className="text-3xl font-bold text-gray-900">324</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">AI Approved</span>
                <span className="text-xs text-gray-500">77%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">1,890</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Flagged</span>
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
          </div>

          {/* Two Columns */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Active Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Spring 2026 Admissions</h4>
                      <span className="text-sm text-emerald-600 font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <p className="text-sm text-gray-600">856 videos · 12 evaluators</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { msg: 'John Doe uploaded 24 videos', time: '2 hours ago' },
                  { msg: 'AI completed evaluation for Spring Batch', time: '3 hours ago' },
                  { msg: 'Niksh reviewed flagged video', time: '5 hours ago' },
                  { msg: 'New evaluator added to team', time: '1 day ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.msg}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
              + New Project
            </button>
            <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition">
              + Upload Videos
            </button>
            <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition">
              + Add Evaluator
            </button>
            <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition">
              📊 View Reports
            </button>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
