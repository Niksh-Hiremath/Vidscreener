"use client";

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Analytics overview</h1>
          <p className="mt-2 text-[var(--muted)] text-sm max-w-2xl leading-relaxed">
            Lightweight calibration and performance signals to support better decisions without dashboard overload.
          </p>
        </div>
        <div>
          <button className="button-secondary h-9 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors hover:text-[var(--foreground)]">
            <svg className="w-4 h-4 mr-2 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Signals
          </button>
        </div>
      </header>

      {/* Top Value Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)] relative overflow-hidden group hover:border-[var(--foreground)] transition-colors">
          <div className="text-sm font-medium text-[var(--muted)] mb-3 tracking-wide uppercase">Total Submissions</div>
          <div className="text-4xl leading-none font-semibold tracking-tight text-[var(--foreground)]">1,204</div>
          <div className="mt-4 text-[13px] font-semibold text-emerald-600 flex items-center gap-1.5">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
             12% vs last month
          </div>
        </div>
        
        <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)] relative overflow-hidden group hover:border-[var(--foreground)] transition-colors">
          <div className="text-sm font-medium text-[var(--muted)] mb-3 tracking-wide uppercase">AI vs Human Deviation</div>
          <div className="text-4xl leading-none font-semibold tracking-tight text-[var(--foreground)]">4.2%</div>
          <div className="mt-4 text-[13px] font-semibold text-[var(--muted)] flex items-center gap-1.5">
             <span className="w-2.5 h-2.5 rounded-full bg-[var(--foreground)] shadow-sm" />
             Highly calibrated
          </div>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-6 shadow-[var(--shadow-sm)] relative overflow-hidden group hover:border-[var(--foreground)] transition-colors">
          <div className="text-sm font-medium text-[var(--muted)] mb-3 tracking-wide uppercase">Avg Throughput</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl leading-none font-semibold tracking-tight text-[var(--foreground)]">42</div>
            <div className="text-[var(--muted)] font-medium text-sm">/ day</div>
          </div>
          <div className="mt-4 text-[13px] font-semibold text-emerald-600 flex items-center gap-1.5">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
             +5 from organization baseline
          </div>
        </div>
      </section>

      {/* Signal Preview section */}
      <div className="flex items-center justify-between mb-8 border-b border-[var(--border-soft)] pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Signal Details</h2>
        <div className="flex items-center gap-4 text-sm font-medium text-[var(--muted)] hidden md:flex">
           <span className="text-[var(--foreground)] cursor-pointer">Last 30 Days</span>
           <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Quarter</span>
           <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Year to Date</span>
        </div>
      </div>
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Project Completion Line Chart Mock */}
        <div className="col-span-1 lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-8 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-base font-semibold text-[var(--foreground)]">Submission Velocity</h3>
               <p className="text-sm text-[var(--muted)] mt-1">Daily cadence of new applicants vs completed evaluations.</p>
            </div>
            <div className="flex items-center gap-5 text-sm text-[var(--muted)] font-medium">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--foreground)] shadow-sm"></span> Submitted</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--border-strong)]"></span> Reviewed</span>
            </div>
          </div>
          
          <div className="relative h-[280px] w-full pt-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between z-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px border-t border-dashed border-[var(--border-soft)]" />
              ))}
            </div>

            {/* SVG Chart Layer */}
            <div className="absolute inset-0 z-10 p-2">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Reviewed Line (Slightly lower, climbing) */}
                  <path d="M0,85 Q15,80 25,65 T45,55 T65,35 T85,25 T100,10" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Submitted Line (Higher peak, leading indicator) */}
                  <path d="M0,75 Q10,65 20,40 T40,25 T60,15 T80,10 T100,2" fill="none" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Data Points on Submitted Line */}
                  <circle cx="20" cy="40" r="1.5" fill="var(--background)" stroke="var(--foreground)" strokeWidth="1" />
                  <circle cx="60" cy="15" r="1.5" fill="var(--background)" stroke="var(--foreground)" strokeWidth="1" />
                  <circle cx="80" cy="10" r="1.5" fill="var(--background)" stroke="var(--foreground)" strokeWidth="1" />
                </svg>
            </div>

            {/* X-Axis labels */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[11px] font-semibold text-[var(--muted)] tracking-wider uppercase">
               <span>Aug 1</span><span>Aug 8</span><span>Aug 15</span><span>Aug 22</span><span>Aug 29</span>
            </div>
          </div>
        </div>

        {/* AI Disagreement Bar/Spread Chart Mock */}
        <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-8 shadow-[var(--shadow-sm)] flex flex-col">
           <div className="mb-10">
            <h3 className="text-base font-semibold text-[var(--foreground)]">AI Variance by Criterion</h3>
            <p className="text-[13.5px] text-[var(--muted)] mt-1 tracking-tight">Percentage of evaluations where human overturned the AI base score by rubric category.</p>
           </div>
           
           <div className="space-y-7 flex-1">
             {[
               { name: "Technical Depth", val: 12 },
               { name: "Structured Communication", val: 34, warn: true },
               { name: "System Design", val: 8 },
               { name: "Cultural Alignment", val: 18 }
             ].map(r => (
               <div key={r.name} className="group">
                 <div className="flex justify-between text-sm font-medium mb-2.5">
                   <span className="text-[var(--foreground)] cursor-default group-hover:underline decoration-[var(--border-strong)] underline-offset-4">{r.name}</span>
                   <span className="text-[var(--muted)] font-mono">{r.val}% Δ</span>
                 </div>
                 <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${r.warn ? 'bg-amber-400' : 'bg-[var(--foreground)]'}`}
                     style={{ width: `${r.val}%` }} 
                   />
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Evaluator Consistency Mock */}
        <div className="bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-2xl p-8 shadow-[var(--shadow-sm)] flex flex-col">
           <div className="mb-10 flex justify-between items-start">
             <div>
               <h3 className="text-base font-semibold text-[var(--foreground)]">Evaluator Consistency</h3>
               <p className="text-[13.5px] text-[var(--muted)] mt-1 tracking-tight">Calibration drift across top reviewers against organizational baseline.</p>
             </div>
           </div>

           <div className="flex-1 w-full relative flex items-end justify-around px-2 pt-10">
             {/* Mock Vertical Bars */}
             {[
               { id: 'Jenna', h: 80, active: false },
               { id: 'Mark', h: 65, active: false },
               { id: 'Alice', h: 95, active: true },
               { id: 'Chris', h: 45, active: false },
               { id: 'Zoe', h: 70, active: false },
             ].map(b => (
               <div key={b.id} className="flex flex-col items-center group relative cursor-pointer w-[12%]">
                 {/* Tooltip visible only when active */}
                 {b.active && (
                   <div className="absolute -top-12 bg-[var(--foreground)] text-[var(--background)] text-[11px] font-semibold px-2.5 py-1.5 rounded-md shadow-[var(--shadow-md)] opacity-100 whitespace-nowrap z-10 pointer-events-none">
                     Harsh grader bias
                     <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--foreground)] rotate-45" />
                   </div>
                 )}
                 <div 
                   className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ease-out ${b.active ? 'bg-rose-400/90 hover:bg-rose-500' : 'bg-[var(--border-strong)] group-hover:bg-[var(--muted)]'}`}
                   style={{ height: `${b.h}%` }}
                 />
                 <span className="text-[11px] font-medium text-[var(--muted)] mt-4">
                   {b.id}
                 </span>
               </div>
             ))}
           </div>
        </div>

      </section>
    </div>
  );
}
