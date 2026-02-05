'use client';

import Link from 'next/link';
import { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';
import { SAMPLE_PROJECTS } from '@/lib/constants';

export default function UploadVideosPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'direct' | 'cloud'>('direct');
  const [cloudFolderUrl, setCloudFolderUrl] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('video/')
      );
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Videos', href: '/admin/videos' },
          { label: 'Upload' }
        ]} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Videos</h2>
            <p className="text-gray-600 mt-1">Upload video submissions for projects</p>
          </div>

          {/* Upload Form */}
          <div className="max-w-4xl">
            {/* Project Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Project <span className="text-red-500">*</span>
              </label>
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">Choose a project...</option>
                {SAMPLE_PROJECTS.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-4">
                Upload Videos <span className="text-red-500">*</span>
              </label>
              
              {/* Upload Method Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setUploadMethod('direct')}
                  className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    uploadMethod === 'direct'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Direct Upload
                </button>
                <button
                  onClick={() => setUploadMethod('cloud')}
                  className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    uploadMethod === 'cloud'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cloud Folder Link
                </button>
              </div>

              {/* Direct Upload */}
              {uploadMethod === 'direct' && (
                <>
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                      ${dragActive 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          Drop video files here or <span className="text-indigo-600">browse</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports: MP4, MOV, AVI, WebM (Max 500MB per file)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Uploaded Files ({uploadedFiles.length})
                      </h3>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="m22 8-6 4 6 4V8Z" />
                              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Cloud Folder Link */}
              {uploadMethod === 'cloud' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Link
                    </label>
                    <input
                      type="url"
                      value={cloudFolderUrl}
                      onChange={(e) => setCloudFolderUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/... or OneDrive link"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Paste a Google Drive or OneDrive folder link containing videos. Make sure the folder is publicly accessible or shared with the system.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-900">Sharing Permissions Required</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Ensure the folder has appropriate sharing settings. For Google Drive, use "Anyone with the link" or specific email permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Upload Options</h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    defaultChecked
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto-assign to evaluators</p>
                    <p className="text-xs text-gray-500 mt-1">Automatically distribute videos to available evaluators</p>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    defaultChecked
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Run AI pre-screening</p>
                    <p className="text-xs text-gray-500 mt-1">Process videos through AI analysis before human review</p>
                  </div>
                </label>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Link href="/admin/videos" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors inline-block">
                Cancel
              </Link>
              <button 
                disabled={!selectedProject || (uploadMethod === 'direct' ? uploadedFiles.length === 0 : !cloudFolderUrl)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                {uploadMethod === 'direct' 
                  ? `Upload ${uploadedFiles.length > 0 ? uploadedFiles.length : ''} Video${uploadedFiles.length !== 1 ? 's' : ''}` 
                  : 'Import from Cloud Folder'
                }
              </button>
            </div>

            {/* Upload Guidelines */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Upload Guidelines
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 ml-6 list-disc">
                <li>Maximum file size: 500MB per video</li>
                <li>Supported formats: MP4, MOV, AVI, WebM</li>
                <li>Recommended resolution: 720p or higher</li>
                <li>File naming: Use applicant ID or name for easy identification</li>
                <li>Videos will be automatically processed and assigned based on your settings</li>  
              </ul>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
