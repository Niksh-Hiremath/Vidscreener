'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import MainContent from '@/components/layout/MainContent';

// Dummy data for charts
const scoreDistributionData = [
  { range: '0-20', count: 12 },
  { range: '21-40', count: 45 },
  { range: '41-60', count: 234 },
  { range: '61-80', count: 856 },
  { range: '81-100', count: 1303 },
];

const videosOverTimeData = [
  { date: 'Jan 29', count: 45 },
  { date: 'Jan 30', count: 52 },
  { date: 'Jan 31', count: 48 },
  { date: 'Feb 1', count: 61 },
  { date: 'Feb 2', count: 58 },
  { date: 'Feb 3', count: 72 },
  { date: 'Feb 4', count: 65 },
  { date: 'Feb 5', count: 79 },
];

const aiAgreementData = [
  { name: 'AI-Human Agreement', value: 94 },
  { name: 'Human Override', value: 6 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav title="Analytics & Reports" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
              <p className="text-gray-600 mt-1">Insights and metrics across all projects</p>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Videos Processed', value: '2,450', change: '+12%', trend: 'up' },
              { label: 'AI Accuracy Rate', value: '94%', change: '+2%', trend: 'up' },
              { label: 'Avg Processing Time', value: '3.2s', change: '-15%', trend: 'up' },
              { label: 'Human Override Rate', value: '6%', change: '-1%', trend: 'up' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  <span className={`text-xs font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Score Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
              <BarChart 
                data={scoreDistributionData} 
                dataKey="count" 
                xKey="range"
              />
            </div>

            {/* Videos Over Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Processed Over Time</h3>
              <LineChart 
                data={videosOverTimeData} 
                dataKey="count" 
                xKey="date"
              />
            </div>
          </div>

          {/* AI vs Human Agreement */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI vs Human Agreement Rate</h3>
            <PieChart data={aiAgreementData} />
          </div>

          {/* Critical Flags Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Flags Summary</h3>
            <div className="space-y-3">
              {[
                { type: 'Time Limit Exceeded', count: 45, percentage: 35 },
                { type: 'Audio Quality Issues', count: 28, percentage: 22 },
                { type: 'Language Mismatch', count: 18, percentage: 14 },
                { type: 'Content Relevance', count: 24, percentage: 19 },
                { type: 'Other', count: 13, percentage: 10 },
              ].map((flag, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{flag.type}</span>
                      <span className="text-sm text-gray-600">{flag.count} videos ({flag.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{width: `${flag.percentage}%`}}
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
