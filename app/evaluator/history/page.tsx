import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

const reviews = [
  { id: '1', applicant: 'John Smith', applicantId: 'APP-2026-1234', project: 'Spring 2026 Admissions', date: '2026-02-05', aiScore: 82, myDecision: 'approved', duration: '4:32' },
  { id: '2', applicant: 'Sarah Johnson', applicantId: 'APP-2026-1235', project: 'Spring 2026 Admissions', date: '2026-02-05', aiScore: 76, myDecision: 'approved', duration: '3:15' },
  { id: '3', applicant: 'David Lee', applicantId: 'APP-2026-1236', project: 'Spring 2026 Admissions', date: '2026-02-04', aiScore: 68, myDecision: 'flagged', duration: '5:48' },
  { id: '4', applicant: 'Emma Wilson', applicantId: 'APP-2026-1237', project: 'MBA Program 2026', date: '2026-02-04', aiScore: 91, myDecision: 'approved', duration: '3:45' },
  { id: '5', applicant: 'James Brown', applicantId: 'APP-2026-1238', project: 'Spring 2026 Admissions', date: '2026-02-03', aiScore: 74, myDecision: 'override', duration: '4:12' },
];

export default function ReviewHistoryPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav title="Review History" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review History</h2>
              <p className="text-gray-600 mt-1">Your past video reviews and decisions</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Reviewed</div>
              <div className="text-3xl font-bold text-gray-900">147</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Approved</div>
              <div className="text-3xl font-bold text-emerald-600">132</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Flagged</div>
              <div className="text-3xl font-bold text-red-600">9</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-600 mb-1">Override Rate</div>
              <div className="text-3xl font-bold text-gray-900">4%</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by applicant..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>All Projects</option>
                <option>Spring 2026 Admissions</option>
                <option>MBA Program 2026</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>All Decisions</option>
                <option>Approved</option>
                <option>Flagged</option>
                <option>Override</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    My Decision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="m22 8-6 4 6 4V8Z" />
                            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.applicant}</p>
                          <p className="text-sm text-gray-500">{review.applicantId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.project}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        review.aiScore >= 80 ? 'bg-green-100 text-green-800' :
                        review.aiScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.aiScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        review.myDecision === 'approved' ? 'bg-green-100 text-green-800' :
                        review.myDecision === 'flagged' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {review.myDecision === 'approved' ? '✓ Approved' :
                         review.myDecision === 'flagged' ? '⚠ Flagged' :
                         '✏ Override'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1-5 of 147 reviews
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Previous
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
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
