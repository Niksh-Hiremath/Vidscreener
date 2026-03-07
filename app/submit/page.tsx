"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitterPortalLanding() {
  const [formId, setFormId] = useState('');
  const router = useRouter();

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formId.trim()) {
       // if they pasted a full URL
      if (formId.includes('submit/')) {
        const extractedId = formId.split('submit/')[1].split('/')[0];
        router.push(`/submit/${extractedId}`);
      } else {
        router.push(`/submit/${formId.trim()}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Submit Application
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the Form ID or Link provided by the organization
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleGo}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="formId" className="sr-only">Form ID</label>
              <input
                id="formId"
                name="formId"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="e.g. 123e4567-e89b-12d3..."
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
