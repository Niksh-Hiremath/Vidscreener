'use client';

import { useState } from 'react';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function VideoReviewPage() {
  const [activeTab, setActiveTab] = useState<'evaluation' | 'flags' | 'chat' | 'info'>('evaluation');
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', message: string}[]>([
    {
      role: 'ai',
      message: "Hello! I'm the AI evaluator. Feel free to ask me about my assessment of this video."
    }
  ]);

  const criteriaScores = [
    { name: 'Communication Skills', score: 25, max: 30, justification: 'The applicant demonstrates clear articulation and confident delivery. However, there are occasional pauses that disrupt flow.' },
    { name: 'Content Relevance', score: 22, max: 25, justification: 'The content directly addresses the prompt with relevant examples from personal experience.' },
    { name: 'Presentation Quality', score: 18, max: 20, justification: 'Good lighting and camera positioning. Professional appearance and background.' },
    { name: 'Creativity', score: 11, max: 15, justification: 'The approach is conventional but well-executed. Limited creative elements.' },
    { name: 'Language Proficiency', score: 9, max: 10, justification: 'Excellent grammar and vocabulary. Minor accent but does not hinder comprehension.' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 uppercase-none">
      <EvaluatorSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Review Queue' },
          { label: 'John Smith - APP-2026-1234' }
        ]} />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            {/* Left: Video Player & Actions */}
            <div className="lg:w-1/2 bg-white flex flex-col overflow-y-auto border-r border-gray-200">
              {/* Video Player Section */}
              <div className="bg-black">
                <div className="w-full aspect-video bg-black flex items-center justify-center relative shadow-2xl">
                  <div className="text-center text-white">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <p className="text-sm opacity-75">Video Player Placeholder</p>
                    <p className="text-xs opacity-50 mt-1">4:32 duration</p>
                  </div>

                  {/* Video Controls (simplified) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <button className="text-white hover:text-emerald-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </button>
                      <div className="flex-1 h-1 bg-gray-600 rounded-full">
                        <div className="h-1 bg-emerald-500 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-white text-sm">1:34 / 4:32</span>
                      <button className="text-white hover:text-emerald-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3.75 7.5v9M8.25 6v12M12.75 7.5v9M17.25 6v12M21.75 7.5v9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Applicant Info Bar */}
                <div className="bg-gray-900 text-white p-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">John Smith</h3>
                      <p className="text-sm text-gray-400">APP-2026-1234 · Spring 2026 Admissions</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Upload Date</div>
                      <div className="font-medium">Feb 2, 2026</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel - Moved below video */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add your observations or feedback..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Approve AI
                    </button>
                    <button className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                      </svg>
                      Flag for Review
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" strokeWidth="1.5" />
                      </svg>
                      Re-review
                    </button>
                    <button className="px-4 py-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                      Override
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium group">
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeWidth="2" />
                      </svg>
                      Previous
                    </button>
                    <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full text-xs">Video 1 of 18</span>
                    <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium group">
                      Next
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Evaluation & Tools */}
            <div className="lg:w-1/2 flex flex-col bg-white">
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  {[
                    { id: 'evaluation' as const, label: 'AI Evaluation', icon: '📊' },
                    { id: 'flags' as const, label: 'Critical Flags', icon: '⚠️', badge: 1 },
                    { id: 'chat' as const, label: 'Chat with AI', icon: '💬' },
                    { id: 'info' as const, label: 'Applicant Info', icon: 'ℹ️' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600 bg-white'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                      {tab.badge && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* AI Evaluation Tab */}
                {activeTab === 'evaluation' && (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200">
                      <div className="text-sm font-medium text-gray-600 mb-2">Overall AI Score</div>
                      <div className="text-5xl font-bold text-emerald-600 mb-2">82</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium text-emerald-600">87%</span>
                      </div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                      <div className="space-y-4">
                        {criteriaScores.map((criterion, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                              <span className="text-lg font-bold text-gray-900">
                                {criterion.score}/{criterion.max}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{width: `${(criterion.score / criterion.max) * 100}%`}}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600">{criterion.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overall Justification */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        The applicant presents a strong overall submission with clear communication skills and relevant content. 
                        The presentation quality is professional, though there is room for more creative approaches to stand out. 
                        Language proficiency is excellent with only minor areas for improvement.
                      </p>
                    </div>
                  </div>
                )}

                {/* Critical Flags Tab */}
                {activeTab === 'flags' && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-1">Time Limit Exceeded</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Video duration is 4:32, which exceeds the maximum allowed time of 4:00 minutes.
                          </p>
                          <div className="flex items-center gap-2 text-xs text-red-700">
                            <span className="px-2 py-1 bg-red-200 rounded">Severity: Medium</span>
                            <span className="px-2 py-1 bg-red-200 rounded">Auto-detected</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Audio Quality: OK</h4>
                          <p className="text-sm text-gray-700">
                            Audio is clear and audible throughout the video.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Language: Accepted</h4>
                          <p className="text-sm text-gray-700">
                            Video language matches accepted languages (English).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat with AI Tab */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggested Questions */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Why was Communication scored 25/30?',
                          'Explain the time limit flag',
                          'Re-analyze creativity score',
                        ].map((question, idx) => (
                          <button
                            key={idx}
                            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-300"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask AI about its evaluation..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Applicant Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Applicant Name</div>
                        <div className="font-medium text-gray-900">John Smith</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Application ID</div>
                        <div className="font-medium text-gray-900">APP-2026-1234</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Upload Date</div>
                        <div className="font-medium text-gray-900">February 2, 2026</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">4:32</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">File Size</div>
                        <div className="font-medium text-gray-900">45.8 MB</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Format</div>
                        <div className="font-medium text-gray-900">MP4 (H.264)</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-2">Additional Metadata</div>
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 font-mono">
                        Email: john.smith@example.com<br />
                        Phone: +1 (555) 123-4567<br />
                        Location: New York, USA
                      </div>
                    </div>
                  </div>
                )}
              </div>


            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
