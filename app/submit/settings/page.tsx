'use client';

import { useState } from 'react';
import SubmitterSidebar from '@/components/layout/SubmitterSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { useAuth } from '@/lib/AuthContext';

export default function SubmitterSettingsPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex h-screen bg-gray-50">
      <SubmitterSidebar />
      
      <MainContent>
        <TopNav title="Settings" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
              {message}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user?.full_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                <p className="text-gray-900 font-medium">{user?.organization_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { label: 'Email notifications for submission status updates', checked: true },
                { label: 'Email notifications when videos are processed', checked: true },
                { label: 'System updates and announcements', checked: true },
              ].map((pref, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={pref.checked}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{pref.label}</span>
                </label>
              ))}
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
