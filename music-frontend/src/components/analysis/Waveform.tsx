import { useRef } from 'react';

interface WaveformProps {
  samples: number[] | null;   // 0–1 peak values
  duration: number;           // in seconds
  currentTime: number;        // in seconds
  onSeek: (time: number) => void;
}

export function Waveform({
  samples,
  duration,
  currentTime,
  onSeek,
}: WaveformProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  if (!samples || !samples.length || !duration) {
    // skeleton / loading state, keeps your colors
    return (
      <div className="relative h-24 overflow-hidden rounded-2xl bg-slate-950/80 px-2 py-6">
        <div className="flex h-full items-center gap-[1px]">
          {Array.from({ length: 160 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-slate-700/60"
              style={{
                height: `${30 + 40 * Math.abs(Math.sin(i * 0.25))}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const totalBars = samples.length;
  const barWidth = 2; // px
  const gap = 1;      // px
  const totalWidth = totalBars * (barWidth + gap); // px

  const progress = Math.min(
    1,
    Math.max(0, currentTime / duration),
  );
  const playheadLeft = progress * totalWidth;

  return (
    <div className="relative h-24 overflow-x-auto rounded-2xl bg-slate-950/80 py-4">
      <div
        ref={innerRef}
        className="relative flex h-full items-center gap-[1px] px-2"
        style={{ width: `${totalWidth + 4}px` }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const pct = Math.min(1, Math.max(0, x / rect.width));
          const time = pct * duration;
          onSeek(time);
        }}
      >
        {/* bars */}
        {samples.map((v, i) => {
          const barPos = (i * (barWidth + gap) + barWidth / 2) / totalWidth;
          const played = barPos <= progress;

          return (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: `${barWidth}px`,
                height: `${8 + v * 90}%`,
                background: played
                  ? 'rgba(34,211,238,0.95)' // cyan-400-ish
                  : 'rgba(30,64,175,0.8)', // blue-800-ish
              }}
            />
          );
        })}

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-1 w-[2px] rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ left: `${playheadLeft}px` }}
        />
      </div>
    </div>
  );
}
