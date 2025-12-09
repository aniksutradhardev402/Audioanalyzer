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
        {/* The "Now" chord display is now a separate floating component */}
      </div>

      {/* chord list */}
      <div
        ref={containerRef}
        className="flex flex-wrap justify-center gap-2"
      >
        {uniqueChords.map((c) => (
          <button
            key={c.chord_name}
            onClick={() => onSeek(c.start_time)}
            className={` h-10 w-20 rounded-xl px-3 py-2 text-base font-semibold transition ${
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
