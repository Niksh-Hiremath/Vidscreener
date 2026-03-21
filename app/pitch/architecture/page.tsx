'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1D1D1F] p-8 font-sans overflow-hidden">
      
      {/* Dynamic injection of Mermaid.js specifically for this page */}
      <Script 
        id="mermaid-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
            mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
          `
        }}
        type="module"
      />

      <div className="max-w-7xl mx-auto mt-6">
        <h2 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-4 text-center">Slide 1</h2>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-16 text-center">
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Architecture.</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
          {/* Architecture Flowchart Map */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-indigo-50 flex flex-col items-center">
             <h3 className="text-2xl font-bold mb-6 text-gray-800 self-start">High-Level Flow</h3>
             
             {/* The raw mermaid syntax inside a correctly tagged pre tag */}
             <pre className="mermaid w-full flex justify-center text-sm font-sans pt-4">
{`flowchart TD
    Client[("💻 Client Side (Next.js UI)")]
    NextServer["⚙️ Next.js Server / API Routes"]
    CloudflareD1[("🗄️ Cloudflare D1 (SQLite)")]
    CloudflareR2[("📦 Cloudflare R2 (Blob Storage)")]
    MultimodalAI{{"🧠 Multimodal AI Engine"}}

    Client <-->|Server Actions| NextServer
    NextServer <-->|Drizzle ORM Queries| CloudflareD1
    NextServer <-->|Upload/Fetch Blobs| CloudflareR2
    NextServer <-->|Sends Context| MultimodalAI
    
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef server fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef db fill:#f1f5f9,stroke:#64748b,stroke-width:2px;
    classDef ai fill:#ede9fe,stroke:#7c3aed,stroke-width:2px;

    class Client client;
    class NextServer server;
    class CloudflareD1,CloudflareR2 db;
    class MultimodalAI ai;`}
             </pre>
          </div>

          {/* Database Schema Map */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-emerald-50 flex flex-col items-center">
             <h3 className="text-2xl font-bold mb-6 text-gray-800 self-start">Drizzle ORM Schema</h3>
             <pre className="mermaid w-full flex justify-center text-xs pt-4">
{`erDiagram
    ORGANIZATIONS ||--o{ USERS : "has members"
    USERS ||--o{ PROJECTS : "creates"
    ORGANIZATIONS ||--o{ PROJECTS : "owns"
    
    PROJECTS ||--o{ PROJECT_RUBRICS : "contains"
    PROJECTS ||--o| PROJECT_FORMS : "has one"
    
    ORGANIZATIONS ||--o{ EVALUATORS : "employs"
    USERS ||--o| EVALUATORS : "can act as"
    PROJECTS ||--o{ PROJECT_EVALUATORS : "assigns"

    USERS ||--o{ PROJECT_FORM_SUBMISSIONS : "submits"
    PROJECT_FORM_SUBMISSIONS ||--o{ PROJECT_FORM_SUBMISSION_ATTACHMENTS : "includes"
    
    PROJECT_FORM_SUBMISSION_ATTACHMENTS ||--o| PROJECT_VIDEO_REVIEWS : "is reviewed in"
    EVALUATORS ||--o{ PROJECT_VIDEO_REVIEWS : "writes"

    PROJECTS {
        int id PK
        text name
    }
    PROJECT_VIDEO_REVIEWS {
        int id PK
        int evaluator_id FK
        text ai_review_json
    }`}
             </pre>
          </div>

        </div>
      </div>
    </div>
  )
}
