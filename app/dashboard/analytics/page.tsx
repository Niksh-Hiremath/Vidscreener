export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Lightweight calibration and performance signals to support better decisions without dashboard overload.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-slate-600">Total Submissions</div>
          <div className="text-5xl leading-none font-semibold mt-2">-</div>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-slate-600">AI vs Human Deviation</div>
          <div className="text-5xl leading-none font-semibold mt-2">-</div>
        </div>
        <div className="surface-card rounded-2xl p-6">
          <div className="text-[15px] text-slate-600">Evaluator Throughput</div>
          <div className="text-5xl leading-none font-semibold mt-2">-</div>
        </div>
      </section>

      <section className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Signal Preview</h2>
        <div className="mt-4 space-y-3">
          {["Project completion trend", "Rubric disagreement trend", "Evaluator consistency"].map((item) => (
            <div key={item} className="surface-muted rounded-xl p-4">
              <div className="text-sm font-medium">{item}</div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-1/3 bg-indigo-500/70 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
