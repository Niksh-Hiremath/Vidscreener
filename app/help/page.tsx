import Logo from '@/components/layout/Logo';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Admin Dashboard
            </Link>
            <Link href="/evaluator/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Evaluator Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Documentation</h1>
          <p className="text-xl text-gray-600">Learn how to use VidScreener effectively</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full px-6 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-base"
            />
            <svg className="absolute right-4 top-3.5 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'Getting Started',
              description: 'Learn the basics of VidScreener',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" strokeWidth="1.5" />
                </svg>
              ),
              color: 'indigo'
            },
            {
              title: 'For Admins',
              description: 'Project setup, rubrics, and management',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" strokeWidth="1.5" />
                </svg>
              ),
              color: 'purple'
            },
            {
              title: 'For Evaluators',
              description: 'Reviewing videos and making decisions',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" strokeWidth="1.5" />
                </svg>
              ),
              color: 'emerald'
            },
            {
              title: 'AI Features',
              description: 'Understanding AI evaluations and scores',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" strokeWidth="1.5" />
                </svg>
              ),
              color: 'blue'
            },
            {
              title: 'Video Upload',
              description: 'Best practices for uploading videos',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" strokeWidth="1.5" />
                </svg>
              ),
              color: 'cyan'
            },
            {
              title: 'FAQ',
              description: 'Frequently asked questions',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" strokeWidth="1.5" />
                </svg>
              ),
              color: 'yellow'
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-4 text-${item.color}-600`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="space-y-4">
            {[
              { title: 'How to create a new project', category: 'Admin Guide' },
              { title: 'Understanding AI confidence scores', category: 'AI Features' },
              { title: 'How to review and approve videos', category: 'Evaluator Guide' },
              { title: 'Creating custom rubrics', category: 'Admin Guide' },
              { title: 'Managing evaluator assignments', category: 'Admin Guide' },
              { title: 'Flagging videos for admin review', category: 'Evaluator Guide' },
              { title: 'Exporting evaluation reports', category: 'Admin Guide' },
              { title: 'Video format requirements', category: 'Getting Started' },
            ].map((article, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-4 px-4 rounded">
                <div>
                  <h4 className="font-medium text-gray-900">{article.title}</h4>
                  <span className="text-xs text-gray-500">{article.category}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeWidth="1.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
          <p className="text-indigo-100 mb-6">Our support team is here to assist you</p>
          <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100">
            Contact Support
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-600">
          © 2026 VidScreener. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
