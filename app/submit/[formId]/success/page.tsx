"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionSuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your video application has been securely uploaded and submitted for review.
        </p>
        
        {id && (
          <div className="bg-gray-50 p-4 rounded-md inline-block mb-6 w-full text-left">
            <p className="text-xs text-gray-500 uppercase font-semibold">Reference ID</p>
            <p className="font-mono text-sm text-gray-900 break-all select-all">{id}</p>
          </div>
        )}

        <div className="space-y-3">
          {id && (
            <Link 
              href={`/submit/status/${id}`}
              className="block w-full text-center bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded hover:bg-gray-50 transition"
            >
              Check Status
            </Link>
          )}
          <a href="https://plaksha.edu.in" className="block text-sm text-blue-600 hover:text-blue-500">
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
