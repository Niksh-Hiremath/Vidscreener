"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeLanding({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[calc(100dvh-64px)] relative bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)] overflow-x-hidden font-sans">
      
      {/* 1. ARCHITECTURAL MONOCHROME BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
        {/* Soft, ultra-subtle ambient cream/slate glow instead of vibrant colors */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] h-[90vw] md:h-[60vw] rounded-full bg-[var(--foreground)] blur-[120px] md:blur-[160px] opacity-[0.03] animate-[pulse_10s_ease-in-out_infinite]" />
        
        {/* Crisp grid overlay to ground the structure */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_85%)] z-10">
          <svg className="absolute inset-0 h-full w-full opacity-40 text-[var(--border-strong)]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="premium-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V.5H40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premium-grid)"></rect>
          </svg>
        </div>
      </div>

      <main className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 pt-20 md:pt-32 pb-24 md:pb-32">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center animate-fade-in-up opacity-0 relative z-30">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] text-[11px] font-bold text-[var(--foreground)] mb-8 md:mb-10 shadow-sm backdrop-blur-md uppercase tracking-widest hover:bg-[var(--surface-2)] transition-colors cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-[var(--foreground)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-sm" />
            Vidscreener v2.0
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-[6.5rem] font-extrabold tracking-tighter text-balance leading-[1.05] text-[var(--foreground)] pb-2">
            Evaluate with AI. <br className="hidden sm:block" />
            <span className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Decide with conviction.
            </span>
          </h1>
          
          <p className="mt-6 md:mt-8 mx-auto max-w-2xl text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed text-[var(--muted)] font-medium text-balance px-4">
            Faster, consistent, and explainable decision-making for admissions, hiring, and program selection. Unifying rigorous human judgment with scalable AI analysis.
          </p>

          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full sm:w-auto px-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-[15px] font-bold tracking-wide hover:opacity-90 transition-all shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] md:hover:-translate-y-1 md:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.3)]">
                Enter Workspace
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            ) : (
              <>
                <Link href="/login" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--surface-1)] border border-[var(--border-strong)] text-[var(--foreground)] flex items-center justify-center text-[15px] font-bold tracking-wide hover:bg-[var(--surface-2)] hover:border-[var(--foreground)] transition-all shadow-sm">
                  Sign in
                </Link>
                <Link href="/register" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-[15px] font-bold tracking-wide hover:opacity-90 transition-all shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] md:hover:-translate-y-1 md:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.3)]">
                  Start evaluating
                </Link>
              </>
            )}
          </div>
        </section>

        {/* 3D INTERACTIVE MOCKUP */}
        <section className="mt-20 md:mt-32 w-full animate-fade-in-up opacity-0 delay-150 perspective-[2000px] z-20 relative">
          <div className="mx-auto max-w-[1000px] relative rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-1000 ease-out md:[transform:rotateX(6deg)_scale(0.95)] md:hover:[transform:rotateX(0deg)_scale(1)] md:hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] ring-1 ring-black/5 group cursor-default">
            
            {/* Window Controls */}
            <div className="h-10 md:h-12 border-b border-[var(--border-soft)] bg-[var(--surface-2)] flex items-center px-4 md:px-5 gap-2.5 w-full relative">
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--border-strong)]" />
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--border-strong)]" />
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--border-strong)]" />
              <div className="absolute left-1/2 -translate-x-1/2 h-5 w-32 md:w-48 rounded bg-[var(--border-soft)] opacity-50" />
            </div>

            {/* Split View Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] bg-[var(--background)]">
              
              {/* Left Side: Video + Controls */}
              <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-soft)] flex flex-col justify-center relative bg-[var(--surface-1)]">
                <div className="w-full aspect-video rounded-2xl bg-[var(--background)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] relative overflow-hidden group/video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent opacity-0 md:group-hover/video:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover/video:opacity-100 transition-opacity md:translate-y-4 md:group-hover/video:translate-y-0 duration-300">
                    <div className="flex gap-4 items-center">
                       <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-sm">
                          <svg className="w-4 h-4 md:w-5 md:h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                       </button>
                       <span className="text-[var(--foreground)] font-mono text-[10px] md:text-xs font-bold tracking-widest hidden sm:block">02:34 / 05:00</span>
                    </div>
                  </div>
                  {/* Mock Play icon centered */}
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 text-[var(--border-strong)] md:group-hover/video:text-[var(--foreground)] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>

                {/* Simulated Floating Tooltip (Hidden on small screens) */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-[var(--foreground)] text-[var(--background)] text-xs font-bold px-4 py-2 rounded-lg shadow-[var(--shadow-md)] opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 translate-y-4 group-hover:-translate-y-12 whitespace-nowrap z-50 pointer-events-none">
                  AI Context Segment
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--foreground)] rotate-45" />
                </div>
              </div>

              {/* Right Side: Explainability AI Analysis (Monochrome) */}
              <div className="p-6 md:p-8 bg-[var(--surface-2)]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight text-[var(--foreground)] uppercase">AI Synthesis</h4>
                  </div>
                  <div className="text-3xl font-black text-[var(--foreground)] leading-none">94<span className="text-sm font-bold text-[var(--muted)]">/100</span></div>
                </div>
                
                <p className="text-[13px] text-[var(--muted)] leading-relaxed font-medium mb-6 md:mb-8">
                  Applicant clearly demonstrated structured problem-solving methodology when addressing the primary technical brief. Deep expertise validated.
                </p>

                <div className="space-y-4 mb-6 md:mb-8">
                  <div className="flex gap-4 items-start bg-[var(--surface-1)] border border-[var(--border-strong)] p-3 rounded-xl shadow-[var(--shadow-sm)] hover:border-[var(--foreground)] transition-colors cursor-default">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-soft)] text-[var(--foreground)] font-mono tracking-wider">01:12</span>
                    <span className="text-[13px] text-[var(--foreground)] font-medium leading-snug">Introduces the base architectural methodology cleanly.</span>
                  </div>
                  <div className="flex gap-4 items-start bg-[var(--foreground)] text-[var(--background)] p-3 rounded-xl shadow-[var(--shadow-sm)] hover:opacity-90 transition-opacity cursor-default relative overflow-hidden">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--background)] text-[var(--foreground)] font-mono tracking-wider">03:45</span>
                    <span className="text-[13px] font-bold leading-snug">Resolves the primary edge case without prompting.</span>
                  </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-extrabold tracking-widest text-[var(--muted)] uppercase mb-3">Confidence Ribbon</h4>
                   <div className="flex w-full h-[18px] rounded overflow-hidden">
                      <div className="bg-[var(--foreground)] opacity-100 w-[20%]" />
                      <div className="bg-[var(--foreground)] opacity-80 w-[45%]" />
                      <div className="bg-[var(--foreground)] opacity-20 w-[15%]" />
                      <div className="bg-[var(--foreground)] opacity-100 w-[20%]" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITION BENTO GRID */}
        <section className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up opacity-0 delay-300 relative z-20">
          
          <div className="md:col-span-2 p-8 md:p-10 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors duration-500 shadow-[var(--shadow-sm)] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--foreground)] opacity-[0.02] blur-[80px] rounded-full group-hover:opacity-[0.05] transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--foreground)] mb-6 md:mb-8 group-hover:border-[var(--foreground)] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--foreground)]">Explainable AI Fabric</h3>
              <p className="mt-3 md:mt-4 text-[var(--muted)] text-[15px] md:text-[16px] leading-relaxed max-w-xl font-medium">
                Every score generated by our engine is grounded with timestamped video references and traceable evidence trails. Reviewers are never left guessing why a conclusion was drawn. Transparency is heavily baked into the pipeline.
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-10 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors duration-500 shadow-[var(--shadow-sm)] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--foreground)] opacity-[0.02] blur-[80px] rounded-full group-hover:opacity-[0.05] transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)] mb-6 md:mb-8 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-[var(--foreground)]">Human-in-the-loop</h3>
                <p className="mt-3 md:mt-4 text-[var(--muted)] text-[14px] md:text-[15px] leading-relaxed font-medium">
                  We augment humans, rather than replace them. Readily override, adjust, and validate AI decisions instantly with intuitive controls.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 p-8 md:p-10 lg:p-14 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-1)] overflow-hidden relative group">
            <div className="absolute inset-0 bg-[var(--surface-2)] -translate-x-[100%] group-hover:translate-x-[0%] transition-transform duration-1000 ease-out flex opacity-50" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-10">
              <div className="max-w-3xl">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-3 md:mb-4">Operational Scale & Analytics</h3>
                <p className="text-[var(--muted)] text-[15px] md:text-[17px] leading-relaxed font-medium">
                  Handle infinite volumes of submissions. Assign evaluators intelligently and track AI vs Human calibration throughput across your entire organization in real-time.
                </p>
              </div>
              <div className="shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                <Link href="/register" className="h-14 px-8 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-base font-bold tracking-wide hover:opacity-90 transition-all shadow-md w-full">
                  Deploy Organization
                </Link>
              </div>
            </div>
          </div>
          
        </section>
      </main>
    </div>
  );
}
