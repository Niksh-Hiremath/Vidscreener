"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EvaluatorSidebar from '@/components/layout/EvaluatorSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function VideoReviewPage() {
  const params = useParams();
  const assignmentId = params.videoId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'evaluation' | 'flags' | 'chat' | 'info'>('evaluation');
  const [assignment, setAssignment] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // We haven't built the AI evaluation API yet, so we'll mock the AI chat and scores for this view
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', message: string}[]>([
    {
      role: 'ai',
      message: "Hello! I'm the AI evaluator. Feel free to ask me about my assessment of this video."
    }
  ]);

  const criteriaScores = [
    { name: 'Communication Skills', score: 25, max: 30, justification: 'The applicant demonstrates clear articulation and confident delivery. However, there are occasional pauses that disrupt flow.' },
    { name: 'Content Relevance', score: 22, max: 25, justification: 'The content directly addresses the prompt with relevant examples from personal experience.' },
  ];

  useEffect(() => {
    async function fetchAssignmentData() {
      try {
        // Technically we need an endpoint to fetch a *single* assignment by ID, including the video and submission details.
        // For now, let's fetch all my assignments and filter down to this one.
        const res = await fetch('/api/evaluators/me/assignments');
        if (res.ok) {
          const data = await res.json();
          const currAssignment = data.assignments?.find((a: any) => a.id === assignmentId);
          if (currAssignment) {
            setAssignment(currAssignment);
            
            // Fetch video player URL
            if (currAssignment.video_id) {
               const urlRes = await fetch(`/api/videos/${currAssignment.video_id}/play-url`);
               if (urlRes.ok) {
                 const { url } = await urlRes.json();
                 setVideoUrl(url);
               }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load assignment", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignmentData();
  }, [assignmentId]);

  if (loading) return <div className="p-8">Loading review...</div>;
  if (!assignment) return <div className="p-8">Assignment not found or you do not have access.</div>;

  return (
    <div className="flex h-screen bg-gray-50 uppercase-none">
      <EvaluatorSidebar />
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Review Queue' },
          { label: assignment.videos?.original_filename || 'Video Review' }
        ]} />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            {/* Left: Video Player & Actions */}
            <div className="lg:w-1/2 bg-white flex flex-col overflow-y-auto border-r border-gray-200">
              <div className="bg-black">
                <div className="w-full aspect-video bg-black flex items-center justify-center relative shadow-2xl">
                   {videoUrl ? (
                     <video 
                       src={videoUrl} 
                       controls 
                       controlsList="nodownload"
                       className="w-full h-full object-contain"
                       playsInline
                     />
                   ) : (
                     <div className="text-white">Video URL not available</div>
                   )}
                </div>

                <div className="bg-gray-900 text-white p-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.applicantName || 'Applicant'}</h3>
                      <p className="text-sm text-gray-400">{assignment.projects?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Due Date</div>
                      <div className="font-medium">{new Date(assignment.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

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
                    <button 
                      onClick={async () => {
                         try {
                           const res = await fetch('/api/evaluations', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               assignment_id: assignmentId,
                               video_id: assignment.video_id,
                               scores: {
                                 communication: 25,
                                 content: 22,
                                 overall: 82
                               },
                               notes: "Mock notes taken from UI or manual input",
                               status: "completed"
                             })
                           });
                           if (res.ok) {
                             alert("Review Submitted successfully!");
                             router.push('/evaluator/dashboard');
                           }
                         } catch (e) {
                           console.error(e);
                         }
                      }}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Submit Review
                    </button>
                    <button className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Flag for Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Evaluation & Tools */}
            <div className="lg:w-1/2 flex flex-col bg-white">
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  {[
                    { id: 'evaluation' as const, label: 'AI Evaluation', icon: '📊' },
                    { id: 'chat' as const, label: 'Chat with AI', icon: '💬' },
                    { id: 'info' as const, label: 'Info', icon: 'ℹ️' },
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
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'evaluation' && (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200">
                      <div className="text-sm font-medium text-gray-600 mb-2">Overall AI Score</div>
                      <div className="text-5xl font-bold text-emerald-600 mb-2">82</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                      <div className="space-y-4">
                        {criteriaScores.map((criterion, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                              <span className="text-lg font-bold text-gray-900">{criterion.score}/{criterion.max}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${(criterion.score / criterion.max) * 100}%`}}></div>
                            </div>
                            <p className="text-sm text-gray-600">{criterion.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Pending AI Integration..." disabled className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm bg-gray-50" />
                      <button disabled className="px-4 py-2 bg-gray-300 text-white rounded-lg">Send</button>
                    </div>
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Status</div>
                        <div className="font-medium text-gray-900">{assignment.status}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Assigned Date</div>
                        <div className="font-medium text-gray-900">{new Date(assignment.created_at).toLocaleDateString()}</div>
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
