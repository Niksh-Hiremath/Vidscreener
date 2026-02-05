'use client';

import Link from 'next/link';

export default function TopNav({ 
  title,
  breadcrumbs 
}: { 
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" strokeWidth="2" />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>

        {/* Profile Dropdown */}
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"></div>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
