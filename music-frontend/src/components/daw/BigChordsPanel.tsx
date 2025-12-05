import { useMemo, useRef } from 'react';
import { ChordEvent } from '../../types/analysis';

export function BigChordPanel({
  chords,
  currentTime,
  onSeek,
}: {
  chords: ChordEvent[];
  currentTime: number;
  onSeek: (t: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  //  unique chord list
  const uniqueChords = useMemo(() => {
    const seen = new Set<string>();
    return chords.filter((c) => {
      if (seen.has(c.chord_name)) return false;
      seen.add(c.chord_name);
      return true;
    });
  }, [chords]);

  // currently playing chord
  const activeChord =
    chords.find(
      (c) => currentTime >= c.start_time && currentTime < c.end_time,
    )?.chord_name ?? '--';

  // wheel-scroll
  const onWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    containerRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div className="mt-5  border-app bg-app-elevated rounded-2xl px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-cyan-200">
          Chords
        </span>

        {/* BIG active chord */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Now</span>
          <div className="  h-14 w-24 flex items-center justify-center rounded-2xl bg-app text-2xl font-bold text-cyan-600 shadow-[0_0_35px_rgba(0,214,214,0.8)]">
            {activeChord}
          </div>
        </div>
      </div>

      {/* chord list */}
      <div
        ref={containerRef}
        onWheel={onWheel}
        className="flex gap-4 overflow-x-hidden"
      >
        {uniqueChords.map((c) => (
          <button
            key={c.chord_name}
            onClick={() => onSeek(c.start_time)}
            className={`min-w-[70px] rounded-xl px-4 py-3 text-lg font-semibold transition ${
              c.chord_name === activeChord
                ? 'bg-[#1fcab3] text-[#020617]'
                : 'bg-app-accent-soft text-slate-200 hover:bg-green-900 cursor-pointer'
            }`}
          >
            {c.chord_name}
          </button>
        ))}
      </div>
    </div>
  );
}
