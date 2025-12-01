const FEATURES = [
  {
    title: 'Metadata Analysis',
    description: 'BPM, key, duration, loudness',
  },
  {
    title: 'Stem Separation',
    description: 'Vocals, drums, bass, instruments',
  },
  {
    title: 'Chord Detection',
    description: 'Timeline with chord progression',
  },
];

export function FeatureGrid() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-center text-xl font-semibold text-slate-50">
        What You&apos;ll Get
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-lg shadow-slate-950/60"
          >
            <div className="text-sm font-semibold text-cyan-400">
              {f.title}
            </div>
            <p className="mt-2 text-xs text-slate-400">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
