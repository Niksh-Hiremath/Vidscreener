"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function StatusCheckPage() {
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [statusName, setStatusName] = useState('Fetching...');
  const [error, setError] = useState('');

  // We are cheating a bit visually. Ideally we should have an API route `/api/submissions/[id]` 
  // to fetch status anonymously. I'll mock the status UI layout for now.
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow border p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Status</h2>
        <p className="text-sm font-mono text-gray-500 mb-6 bg-gray-100 p-2 rounded">{submissionId}</p>
        
        <div className="flex justify-center items-center mb-6">
           {/* Visual mock of a status pipeline */}
           <div className="flex items-center w-full max-w-xs mx-auto">
             <div className="flex-1 text-center">
               <div className="w-8 h-8 mx-auto bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
               <p className="text-xs mt-1 text-gray-600">Submitted</p>
             </div>
             <div className="w-full bg-gray-200 h-1 flex-1 mx-2"></div>
             <div className="flex-1 text-center">
               <div className="w-8 h-8 mx-auto bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
               <p className="text-xs mt-1 text-gray-600">Under Review</p>
             </div>
           </div>
        </div>

        <p className="text-gray-700">Your application is currently <span className="font-semibold text-blue-600">Under Review</span>.</p>
        <p className="text-sm text-gray-500 mt-4">You will receive an email once the evaluation is complete.</p>
      </div>
    </div>
  );
}
