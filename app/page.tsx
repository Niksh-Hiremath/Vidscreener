'use client';

import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Liquid background layers */}
      <div 
        className="absolute inset-0 transition-all duration-[800ms] ease-out"
        style={{
          background: `
            radial-gradient(circle 800px at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(99, 102, 241, 0.25) 0%, 
              rgba(139, 92, 246, 0.15) 30%, 
              transparent 70%),
            radial-gradient(circle 1200px at ${mousePosition.x * 0.8}% ${mousePosition.y * 1.1}%, 
              rgba(168, 85, 247, 0.2) 0%, 
              rgba(236, 72, 153, 0.1) 25%, 
              transparent 60%),
            radial-gradient(circle 1000px at ${mousePosition.x * 1.2}% ${mousePosition.y * 0.9}%, 
              rgba(59, 130, 246, 0.15) 0%, 
              rgba(147, 197, 253, 0.08) 35%, 
              transparent 65%),
            linear-gradient(135deg, 
              rgba(248, 250, 252, 1) 0%, 
              rgba(241, 245, 249, 1) 50%, 
              rgba(224, 231, 255, 0.9) 100%)
          `,
          filter: 'blur(60px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/login" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Admin Login
            </Link>
            <Link 
              href="/evaluator/login" 
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Evaluator Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Automate Video Evaluation
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          AI-powered video screening with human oversight. Perfect for college applications, hiring, and content review.
        </p>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
          <Link 
            href="/admin/login"
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-200"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">For Admins</h3>
            <p className="text-gray-600 mb-4">
              Create projects, upload videos, manage evaluators
            </p>
            <span className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium">
              Get Started as Admin
            </span>
          </Link>

          <Link 
            href="/evaluator/login"
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-emerald-200"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="m3 17 2 2 4-4" />
                <path d="m3 7 2 2 4-4" />
                <path d="M13 6h8" />
                <path d="M13 12h8" />
                <path d="M13 18h8" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">For Evaluators</h3>
            <p className="text-gray-600 mb-4">
              Review AI evaluations, ensure quality
            </p>
            <span className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium">
              Get Started as Evaluator
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Automatic evaluation using custom rubrics with confidence scoring
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Human Oversight</h3>
            <p className="text-gray-600">
              Evaluators audit AI decisions to ensure accuracy and fairness
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Streamlined Workflow</h3>
            <p className="text-gray-600">
              Bulk upload and manage thousands of videos efficiently
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-20 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2026 VidScreener. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
              Help Center
            </Link>
            <Link href="/support" className="text-sm text-gray-600 hover:text-gray-900">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
      </div> {/* End content overlay */}
    </div>
  );
}
