'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopNav from '@/components/layout/TopNav';
import MainContent from '@/components/layout/MainContent';

export default function RubricBuilderPage() {
  const [criteria, setCriteria] = useState([
    { id: 1, name: 'Communication Skills', description: 'Clarity, articulation, and effectiveness of communication', weight: 30, maxPoints: 30 },
    { id: 2, name: 'Content Relevance', description: 'How well the content addresses the prompt', weight: 25, maxPoints: 25 },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <MainContent>
        <TopNav breadcrumbs={[
          { label: 'Projects' },
          { label: 'Spring 2026 Admissions' },
          { label: 'Edit Rubric' }
        ]} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rubric Builder</h2>
            <p className="text-gray-600 mt-1">Define evaluation criteria for this project</p>
          </div>

          {/* Rubric Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubric Name
                </label>
                <input
                  type="text"
                  defaultValue="Spring 2026 Admissions Rubric"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Points
                </label>
                <input
                  type="number"
                  value="100"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue="Comprehensive evaluation rubric for Spring 2026 admissions video submissions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Criteria List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Evaluation Criteria</h3>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                + Add Criterion
              </button>
            </div>

            <div className="space-y-4">
              {criteria.map((criterion, idx) => (
                <div key={criterion.id} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <button className="mt-2 text-gray-400 hover:text-gray-600 cursor-move">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 9h8M8 15h8" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Criterion Name
                          </label>
                          <input
                            type="text"
                            defaultValue={criterion.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight (%)
                            </label>
                            <input
                              type="number"
                              defaultValue={criterion.weight}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Points
                            </label>
                            <input
                              type="number"
                              defaultValue={criterion.maxPoints}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          defaultValue={criterion.description}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button className="mt-2 text-red-400 hover:text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="m19 7-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Weight Indicator */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Weight Distribution</span>
                <span className="text-sm font-bold text-gray-900">
                  {criteria.reduce((sum, c) => sum + c.weight, 0)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${criteria.reduce((sum, c) => sum + c.weight, 0) === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{width: `${criteria.reduce((sum, c) => sum + c.weight, 0)}%`}}
                ></div>
              </div>
              {criteria.reduce((sum, c) => sum + c.weight, 0) !== 100 && (
                <p className="mt-2 text-xs text-amber-600">
                  ⚠️ Total weight should equal 100%
                </p>
              )}
            </div>
          </div>

          {/* AI Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Evaluation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-gray-700">Enable automatic AI evaluation for new uploads</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-gray-700">Flag videos with confidence score below 70%</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-gray-700">Require evaluator review for all flagged videos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
              Save Rubric
            </button>
          </div>
        </main>
      </MainContent>
    </div>
  );
}
