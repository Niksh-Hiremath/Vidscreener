"use client";

import Link from "next/link";
import Footer from "./Footer";

export default function HomeLanding({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="min-h-screen relative bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-[var(--color-primary)] selection:text-white overflow-x-hidden font-sans">

      {/* ============================================================
          BACKGROUND LAYER — Brand-purposed ambient + subtle grid
          Coral glow guides the eye to content; grid adds structure
          without visual noise (40% → 15% opacity on dark)
      ============================================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none">

        {/* Primary coral-red ambient glow — upper center, behind hero */}
        <div
          aria-hidden="true"
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] md:w-[55vw] h-[60vh] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, var(--glow-primary) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Secondary coral glow — lower center, under video mockup, creates depth */}
        <div
          aria-hidden="true"
          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, var(--glow-primary-subtle) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Structural dot grid — faded to near-invisible, breathes on dark */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, var(--glow-dot) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5) 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5) 70%, transparent 100%)",
          }}
        />
      </div>

      <main className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 pt-20 md:pt-36 pb-28 md:pb-36">

        {/* ============================================================
            HERO — Asymmetric weight: badge left-anchored, headline
            large, CTA below. Coral accent guides primary action.
        ============================================================ */}
        <section className="flex flex-col items-center text-center animate-fade-in-up opacity-0 relative z-30">

          {/* Brand badge — coral-red pill with live indicator, always centered */}
          <div className="inline-flex items-center gap-2 pl-4 pr-5 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] font-semibold text-[var(--color-text-muted)] mb-10 md:mb-12 uppercase tracking-widest">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            VidScreener v3
          </div>

          {/* Headline — large, bold, with coral primary action */}
          <h1 className="text-5xl sm:text-6xl lg:text-[clamp(3.5rem,7vw,6.5rem)] font-extrabold tracking-tight leading-[1.02] text-[var(--color-text)] w-full max-w-5xl">
            <span className="text-[var(--color-primary)]">Evaluate with AI.</span>
            <br />
            {/* nowrap ensures "Decide with conviction." stays as one unbroken unit */}
            <span className="whitespace-nowrap headline-accent">Decide with conviction.</span>
          </h1>

          {/* Sub-headline — softer weight, comfortable reading */}
          <p className="mt-6 md:mt-8 mx-auto max-w-2xl text-[17px] sm:text-[19px] leading-relaxed text-[var(--color-text-muted)] font-normal text-balance px-2">
            Faster, consistent, and explainable decision-making for admissions, hiring, and program selection. Unifying rigorous human judgment with scalable AI analysis.
          </p>

          {/* CTAs — primary coral, secondary ghost */}
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full sm:w-auto px-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center text-[15px] font-bold tracking-wide hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--shadow-cta)]"
              >
                Enter Workspace
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center text-[15px] font-semibold tracking-wide hover:bg-[var(--color-border)] transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center text-[15px] font-bold tracking-wide hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--shadow-cta)]"
                >
                  Start evaluating
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ============================================================
            VIDEO PLAYER MOCKUP — The focal centerpiece.
            Coral glow halo lifts it off the background.
            Preserves the 3D tilt + hover reveal the user loves.
        ============================================================ */}
        <section
          aria-label="AI evaluation interface preview"
          className="mt-20 md:mt-36 w-full animate-fade-in-up opacity-0 delay-150 perspective-[2000px] z-20 relative"
          style={{ animationDelay: "150ms" }}
        >
          <h2 className="sr-only">AI Evaluation Interface</h2>
          {/* Coral glow halo behind the card — lifts the focal piece */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -translate-y-1/4 scale-105 rounded-[2.5rem] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, var(--glow-primary-strong) 0%, transparent 65%)",
              filter: "blur(60px)",
              zIndex: -1,
            }}
          />

          <div className="mx-auto max-w-[1000px] relative rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card),0_0_0_1px_var(--shadow-border-tint)] overflow-hidden transition-all duration-700 ease-out md:[transform:rotateX(5deg)_scale(0.96)] md:hover:[transform:rotateX(0deg)_scale(1)] md:hover:shadow-[var(--shadow-card-hover),0_0_0_1px_var(--shadow-border-tint-hover)] group cursor-default">

            {/* Window controls — coral-tinted */}
            <div className="h-10 md:h-11 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center px-4 md:px-5 gap-2.5 w-full relative">
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--color-primary)] opacity-80" />
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--color-border)]" />
              <div className="h-2.5 md:h-3 w-2.5 md:w-3 rounded-full bg-[var(--color-border)]" />
              <div className="absolute left-1/2 -translate-x-1/2 h-[3px] w-28 md:w-44 rounded-full bg-[var(--color-border)] opacity-40" />
            </div>

            {/* Split view: video left, AI analysis right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">

              {/* Left: Video player */}
              <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] flex flex-col justify-center relative bg-[var(--color-surface)]">

                {/* Video frame */}
                <div className="w-full aspect-video rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] relative overflow-hidden group/video flex items-center justify-center shadow-[var(--shadow-inset-tint)]">

                  {/* Subtle coral inner glow on the video frame */}
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at center, var(--glow-primary-faint) 0%, transparent 70%)" }} />

                  {/* Video progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-border)]">
                    <div className="h-full w-[38%] bg-[var(--color-primary)] rounded-r-full" />
                  </div>

                  {/* Hover: reveal controls */}
                  <div className="absolute inset-0 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play button — coral on hover */}
                  <button
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 md:group-hover/video:scale-110 shadow-[var(--shadow-play)]"
                    aria-label="Play video"
                  >
                    <svg className="w-6 h-6 md:w-7 md:h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* AI Context tooltip — appears on hover */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold px-4 py-2 rounded-xl shadow-[var(--shadow-md)] opacity-0 group-hover/video:opacity-100 transition-all duration-500 delay-200 whitespace-nowrap z-10 pointer-events-none">
                    <span className="text-[var(--color-primary)]">AI</span> Context Segment · 01:12
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] rotate-45" />
                  </div>
                </div>

                {/* Video meta — evaluator labels */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  <span className="text-[11px] text-[var(--color-text-muted)] font-medium tracking-wide">Review Session · Priya Sharma · YCL 2026</span>
                </div>
              </div>

              {/* Right: AI Synthesis panel */}
              <div className="p-5 md:p-7 bg-[var(--color-bg)]">

                {/* Score + heading row */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">AI Synthesis</h3>
                    <h4 className="text-sm font-bold text-[var(--color-text)] tracking-tight">Evaluation Score</h4>
                  </div>
                  <div className="text-4xl font-black leading-none text-[var(--color-primary)]">
                    94<span className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">/100</span>
                  </div>
                </div>

                {/* Summary text */}
                <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed mb-5">
                  Applicant clearly demonstrated structured problem-solving methodology when addressing the primary technical brief. Deep expertise validated.
                </p>

                {/* Timestamp-grounded evidence cards */}
                <div className="space-y-3 mb-5">
                  {/* Lowlight card */}
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] group/ev hover:border-[var(--color-primary)]/40 transition-colors duration-200">
                    <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] mt-0.5">01:12</span>
                    <p className="text-[12px] text-[var(--color-text)] leading-snug font-medium">Introduces the base architectural methodology cleanly.</p>
                  </div>
                  {/* Highlight card — coral accent, stands out */}
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5 group/ev hover:bg-[var(--color-primary)]/10 transition-colors duration-200">
                    <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] mt-0.5">03:45</span>
                    <p className="text-[12px] text-[var(--color-primary)] leading-snug font-semibold">Resolves the primary edge case without prompting.</p>
                  </div>
                </div>

                {/* Confidence ribbon — coral-red gradation */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2.5">Confidence Ribbon</p>
                  <div className="flex w-full h-[6px] rounded-full overflow-hidden gap-px bg-[var(--color-border)]">
                    <div className="bg-[var(--color-primary)] flex-1" />
                    <div className="bg-[var(--color-primary)] opacity-80 flex-1" />
                    <div className="bg-[var(--color-primary)] opacity-30 flex-1" />
                    <div className="bg-[var(--color-primary)] flex-1" />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-[var(--color-text-muted)]">Low signal</span>
                    <span className="text-[9px] text-[var(--color-primary)] font-semibold">High confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            VALUE PROPOSITION BENTO — Asymmetric layout.
            Featured card (wide) dominates; compact card is secondary.
            Coral glow on hover. Strip reveal animation kept.
        ============================================================ */}
        <section
          className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up opacity-0 relative z-20"
          style={{ animationDelay: "300ms" }}
        >

          {/* Feature card — wide, visually dominant */}
          <div className="md:col-span-2 p-8 md:p-10 lg:pr-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 transition-colors duration-500 group relative overflow-hidden">
            {/* Coral glow on hover — purposeful, brand-aligned */}
            <div
              aria-hidden="true"
              className="absolute top-[-30%] right-[-10%] w-[400px] h-[300px] rounded-full pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at center, var(--glow-card-hover) 0%, transparent 70%)", filter: "blur(60px)" }}
            />
            <div className="relative z-10">
              <div className="mb-7">
                <div className="h-11 w-11 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mb-6 shadow-[var(--shadow-card-icon)]">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--color-text)]">Explainable AI Fabric</h3>
              </div>
              <p className="text-[var(--color-text-muted)] text-[15px] md:text-[16px] leading-relaxed max-w-xl">
                Every score generated by our engine is grounded with timestamped video references and traceable evidence trails. Reviewers are never left guessing why a conclusion was drawn.
              </p>
              {/* Inline metric strip */}
              <div className="mt-7 flex items-center gap-6">
                <div>
                  <p className="text-2xl font-black text-[var(--color-primary)]">100%</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Timestamp-grounded</p>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div>
                  <p className="text-2xl font-black text-[var(--color-text)]">3min</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Avg. review time</p>
                </div>
                <div className="w-px h-8 bg-[var(--color-border)]" />
                <div>
                  <p className="text-2xl font-black text-[var(--color-text)]">4.2%</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">AI deviation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact card — secondary weight */}
          <div className="p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 transition-colors duration-500 group relative overflow-hidden flex flex-col">
            <div
              aria-hidden="true"
              className="absolute top-[-20%] right-[-20%] w-[250px] h-[250px] rounded-full pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at center, var(--glow-card-hover-light) 0%, transparent 70%)", filter: "blur(50px)" }}
            />
            <div className="relative z-10 flex flex-col flex-1">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:border-[var(--color-primary)]/40 transition-colors">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[var(--color-text)] mb-3">Human-in-the-loop</h3>
              <p className="text-[var(--color-text-muted)] text-[14px] leading-relaxed flex-1">
                We augment humans, not replace them. Override, adjust, and validate AI decisions instantly.
              </p>
              <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
                <span className="text-[11px] font-semibold text-[var(--color-primary)] uppercase tracking-wider">Always in control</span>
              </div>
            </div>
          </div>

          {/* Full-width CTA card — coral strip reveal on hover */}
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden group relative">
            {/* Coral strip that slides in from left on hover */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out"
              style={{ background: "linear-gradient(90deg, var(--glow-strip-start) 0%, var(--glow-strip-end) 60%, transparent 100%)" }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-8 md:p-12 lg:py-10">
              <div className="max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">
                  Operational Scale &amp; Analytics
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px] md:text-[16px] leading-relaxed">
                  Handle infinite submission volumes. Assign evaluators intelligently. Track AI vs Human calibration across your entire organization in real-time.
                </p>
              </div>
              <Link
                href="/register"
                className="shrink-0 h-[52px] px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white text-[15px] font-bold hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--shadow-deploy)]"
              >
                Deploy Organization
              </Link>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
