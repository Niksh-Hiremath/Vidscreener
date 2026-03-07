"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { STATUS_COLORS } from '@/lib/constants';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <MainContent>
        <TopNav title="Video Management" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Video Management</h2>
              <p className="text-gray-600 mt-1">Manage all video submissions across projects</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading videos...</td></tr>
                ) : videos.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No videos found.</td></tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{video.submissions?.submitter_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{video.original_filename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{video.projects?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(video.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[video.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'}`}>
                          {video.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
