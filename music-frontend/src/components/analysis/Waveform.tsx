interface Props {
  label?: string;
}

export function Waveform({ label = 'WAVEFORM' }: Props) {
  const bars = Array.from({ length: 48 });

  return (
    <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/70">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>{label}</span>
        <button className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-cyan-300">
          Vocals
        </button>
      </div>
      <div className="flex h-24 items-end gap-[2px] overflow-hidden rounded-2xl bg-slate-950/70 px-3 py-4">
        {bars.map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-slate-600"
            style={{
              height: `${30 + 40 * Math.abs(Math.sin(i * 0.45))}%`,
              opacity: 0.6 + 0.4 * Math.abs(Math.sin(i * 0.23)),
            }}
          />
        ))}
      </div>
    </section>
  );
}
