'use client';

import { useState, use } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [fields, setFields] = useState([
    { id: '1', type: 'text', label: 'Project Title', required: true },
    { id: '2', type: 'textarea', label: 'Project Description', required: true },
    { id: '3', type: 'file_video', label: 'Video Pitch', required: true },
    { id: '4', type: 'file_pdf', label: 'Supporting Documentation', required: false },
  ]);

  const [formName, setFormName] = useState('Standard Technical Project Submission');
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const addField = (type: string) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type.replace('_', ' ')} Field`,
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call to save form fields in DB
    setTimeout(() => {
      setIsSaving(false);
      setShowShareModal(true);
    }, 800);
  };

  const shareLink = `http://localhost:3000/submit/${id}`;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Projects', href: '/admin/projects' },
          { label: 'Spring 2026 Admissions', href: `/admin/projects/${id}` },
          { label: 'Form Builder' }
        ]} />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-3xl font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full mb-2 outline-none hover:bg-gray-100 rounded px-2 -ml-2 transition-colors"
                placeholder="Form Name"
              />
              <p className="text-gray-500">Customize the information you collect from submitters.</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/admin/projects/${id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </Link>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save & get link'}
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Form Canvas */}
            <div className="flex-1 max-w-3xl space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group transition-all hover:border-indigo-300">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => removeField(field.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="font-medium text-gray-900 border-b border-dashed border-gray-300 pb-1 mb-2 bg-transparent focus:outline-none focus:border-indigo-500 w-full"
                          placeholder="Field Label"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {field.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Preview rendering based on type */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-400">
                        {field.type === 'text' && "Short text response limit: 120 chars"}
                        {field.type === 'textarea' && "Long paragraph response"}
                        {field.type === 'file_video' && "Video Upload Area (.mp4, .mov)"}
                        {field.type === 'file_pdf' && "PDF Upload Area"}
                      </div>

                      <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <span>Required</span>
                          <div className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${field.required ? 'bg-indigo-600' : 'bg-gray-300'}`} onClick={() => updateField(field.id, { required: !field.required })}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${field.required ? 'translate-x-4' : ''}`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-dashed border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                <p>Drag elements from the sidebar to add fields.</p>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="w-72">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-8">
                <div className="p-4 border-b border-gray-200 font-semibold text-gray-900">
                  Form Elements
                </div>
                <div className="p-4 space-y-2">
                  <button onClick={() => addField('text')} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm font-medium flex gap-3 items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    Short Text
                  </button>
                  <button onClick={() => addField('textarea')} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm font-medium flex gap-3 items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    Paragraph
                  </button>
                  <button onClick={() => addField('file_video')} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm font-medium flex gap-3 items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Video Upload
                  </button>
                  <button onClick={() => addField('file_pdf')} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm font-medium flex gap-3 items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Document Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Form Published!</h2>
              <p className="text-center text-gray-600 mb-6">Your submission form is now live. Share this link with your submitters.</p>
              
              <div className="flex items-center gap-2 mb-8">
                <input 
                  type="text" 
                  readOnly 
                  value={shareLink}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 outline-none"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  Copy
                </button>
              </div>

              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </MainContent>
    </div>
  );
}
