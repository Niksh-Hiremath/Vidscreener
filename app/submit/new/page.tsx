"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubmitterSidebar from '@/components/layout/SubmitterSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

const DEMO_FORMS = [
  {
    id: 'demo-1',
    title: 'Summer Internship 2024',
    organization: 'VidScreener Global',
    description: 'Apply for our summer engineering internship. Requires a 2-minute video introduction.',
    category: 'Internship',
    deadline: 'May 15, 2024',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'demo-2',
    title: 'Product Designer Role',
    organization: 'DesignStudio',
    description: 'Join our award-winning design team. Share your portfolio and a video walk-through of your best project.',
    category: 'Full-time',
    deadline: 'June 01, 2024',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'demo-3',
    title: 'Senior Frontend Architect',
    organization: 'TechFlow',
    description: 'Looking for experts in React and Next.js. Record a video explaining a complex architecture you built.',
    category: 'Senior',
    deadline: 'April 30, 2024',
    color: 'from-blue-500 to-cyan-500'
  }
];

export default function SubmitterPortalLanding() {
  const [formId, setFormId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formId.trim()) {
      if (formId.includes('submit/')) {
        const extractedId = formId.split('submit/')[1].split('/')[0];
        router.push(`/submit/${extractedId}`);
      } else {
        router.push(`/submit/${formId.trim()}`);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SubmitterSidebar />
      <MainContent>
        <TopNav title="Discovery" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Opportunities</h2>
              <p className="mt-2 text-lg text-gray-600">Discover projects and submit your application via video.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                ))
              ) : (
                DEMO_FORMS.map((form) => (
                  <div 
                    key={form.id} 
                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => router.push(`/submit/${form.id}`)}
                  >
                    <div className={`h-32 bg-gradient-to-br ${form.color} p-6 flex flex-col justify-between`}>
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full w-fit">
                        {form.category}
                      </span>
                      <h3 className="text-white text-xl font-bold leading-tight">{form.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-500 mb-2 font-medium">{form.organization}</p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {form.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                          Deadline: {form.deadline}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
              <div className="max-w-xl mx-auto">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L7.04 9.348a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Have a direct link?</h3>
                <p className="text-gray-600 mb-8">
                  If you received a Form ID or a direct link from an organization, you can enter it here to jump straight to the submission page.
                </p>
                <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleGo}>
                  <input
                    type="text"
                    required
                    placeholder="Enter Form ID (e.g. 123e4567...)"
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                  >
                    Go to Form
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
