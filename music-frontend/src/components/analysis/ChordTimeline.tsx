import { ChordEvent } from '../../types/analysis';

interface Props {
  chords: ChordEvent[];
}

export function ChordTimeline({ chords }: Props) {
  if (!chords.length || chords[0].error) {
    return (
      <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Chord Progression
        </div>
        <p>Chord detection failed or no chords were found.</p>
      </section>
    );
  }

  const totalDuration = chords[chords.length - 1].end_time;

  return (
    <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/70">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>Chord Progression</span>
      </div>
      <div className="mb-4 flex h-14 overflow-hidden rounded-2xl bg-slate-950/70">
        {chords.map((c, idx) => {
          const width = ((c.end_time - c.start_time) / totalDuration) * 100;
          return (
            <div
              key={`${c.chord_name}-${idx}`}
              className="flex items-center justify-center border-r border-slate-900 text-xs font-semibold text-slate-50"
              style={{ width: `${width}%` }}
            >
              {c.chord_name}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1 text-[11px]">
        {chords.slice(0, 24).map((c, idx) => (
          <span
            key={idx}
            className="rounded-full bg-slate-800 px-2 py-1 text-slate-200"
          >
            {c.chord_name}
          </span>
        ))}
      </div>
    </section>
  );
}
