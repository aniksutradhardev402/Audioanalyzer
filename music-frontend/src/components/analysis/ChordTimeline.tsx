export function ChordTimeline({
  chords,
  duration,
  currentTime,
  onSeek,
}: any) {
  return (
    <div className="flex h-12 bg-slate-900 rounded-xl overflow-hidden">
      {chords.map((c: any, i: number) => {
        const width = ((c.end_time - c.start_time) / duration) * 100;
        const active =
          currentTime >= c.start_time && currentTime < c.end_time;

        return (
          <div
            key={i}
            className={`flex items-center justify-center text-xs ${
              active
                ? 'bg-cyan-400 text-black'
                : 'bg-slate-800 text-slate-200'
            }`}
            style={{ width: `${Math.max(width, 2)}%` }}
            onClick={() => onSeek(c.start_time)}
          >
            {c.chord_name}
          </div>
        );
      })}
    </div>
  );
}
