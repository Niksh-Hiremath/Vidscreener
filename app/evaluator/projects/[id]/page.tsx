import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import { SAMPLE_VIDEOS } from '@/lib/constants';
import Link from 'next/link';
import MainContent from '@/components/layout/MainContent';

export default function EvaluatorProjectVideosPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'My Projects' },
          { label: 'Spring 2026 Admissions' }
        ]} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Spring 2026 Admissions</h2>
            <p className="text-gray-600 mt-1">Your assigned videos for review</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Assigned to You</div>
              <div className="text-2xl font-bold text-gray-900">45</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">18</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Reviewed</div>
              <div className="text-2xl font-bold text-emerald-600">24</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Flagged</div>
              <div className="text-2xl font-bold text-red-600">3</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
              Pending Review (18)
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              All Videos (45)
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Flagged (3)
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Completed (24)
            </button>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_VIDEOS.map((video) => (
              <div key={video.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                    {video.duration}
                  </div>
                  {video.criticalFlags && video.criticalFlags.length > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{video.applicantName}</h3>
                  <p className="text-sm text-gray-500 mb-3">{video.applicantId}</p>

                  {/* AI Score */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">AI Score</span>
                    <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                      video.aiScore >= 80 ? 'bg-green-100 text-green-800' :
                      video.aiScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {video.aiScore}/100
                    </span>
                  </div>

                  {/* Critical Flags */}
                  {video.criticalFlags && video.criticalFlags.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      ⚠️ {video.criticalFlags[0].message}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href="/evaluator/review/vid-001"
                    className="block w-full text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                  >
                    Start Review
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Previous
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Next
              </button>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
