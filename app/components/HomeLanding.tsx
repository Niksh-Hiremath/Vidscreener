"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeLanding({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-[800ms] ease-out"
        style={{
          background: `
            radial-gradient(circle 800px at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(99, 102, 241, 0.22) 0%,
              rgba(139, 92, 246, 0.12) 30%,
              transparent 70%),
            radial-gradient(circle 1200px at ${mousePosition.x * 0.8}% ${mousePosition.y * 1.1}%,
              rgba(168, 85, 247, 0.16) 0%,
              rgba(236, 72, 153, 0.08) 25%,
              transparent 60%),
            radial-gradient(circle 1000px at ${mousePosition.x * 1.2}% ${mousePosition.y * 0.9}%,
              rgba(59, 130, 246, 0.14) 0%,
              rgba(147, 197, 253, 0.08) 35%,
              transparent 65%),
            linear-gradient(135deg,
              rgba(248, 250, 252, 1) 0%,
              rgba(241, 245, 249, 1) 50%,
              rgba(224, 231, 255, 0.86) 100%)
          `,
          filter: "blur(56px)",
          transform: "scale(1.08)",
        }}
      />

      <main className="relative z-10">
        <section className="min-h-[calc(100dvh-65px)] flex items-center">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-600 font-semibold">VidScreener</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
              Structured Video Evaluation,
              <span className="block text-indigo-600 mt-2">with AI + Human Judgment.</span>
            </h1>
            <p className="mt-5 mx-auto max-w-3xl text-base md:text-xl text-slate-600 leading-relaxed">
              Faster, consistent, and explainable decision-making for admissions, hiring, and program selection.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="button-primary rounded-xl px-6 py-3 text-sm font-medium">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="button-secondary rounded-xl px-6 py-3 text-sm font-medium shadow">
                    Login
                  </Link>
                  <Link href="/register" className="button-primary rounded-xl px-6 py-3 text-sm font-medium shadow">
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="mt-14 flex justify-center" aria-hidden="true">
              <svg className="h-6 w-6 text-slate-500 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailCard
            title="Explainable AI"
            desc="Every AI score is grounded with timestamp references and evidence trails for transparent review."
          />
          <DetailCard
            title="Human-in-the-loop"
            desc="Evaluators validate and finalize decisions, ensuring quality and accountability in every outcome."
          />
          <DetailCard
            title="Operational Scale"
            desc="Manage projects, evaluators, and high submission volumes through one streamlined workflow."
          />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="surface-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-slate-900">Core capabilities</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Rubric-based criterion scoring with confidence signals</li>
              <li>Timeline and key-moment support for faster evaluator navigation</li>
              <li>AI chat and insights grounded to submission context</li>
              <li>Admin analytics for throughput and calibration visibility</li>
            </ul>
          </div>

          <div className="surface-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-slate-900">Simple workflow</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Submitter uploads video and form response</li>
              <li>2. AI produces rubric-aligned first-pass analysis</li>
              <li>3. Evaluator reviews, adjusts, and finalizes</li>
              <li>4. Admin tracks quality and progress in dashboard</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

function DetailCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
