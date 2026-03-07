'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/layout/Logo';

export default function EvaluatorForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // In a real implementation this would trigger an email
    // For now we'll simulate the API call
    try {
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Reset Evaluator Password</h1>
          <p className="text-gray-600 mt-2">We'll send you instructions via email</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-gray-600">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <Link 
                href="/evaluator/login"
                className="w-full block text-center px-6 py-3 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="evaluator@vidscreener.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full block text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <Link href="/evaluator/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
