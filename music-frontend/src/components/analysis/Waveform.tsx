// src/components/analysis/Waveform.tsx
import { useRef } from 'react';

interface WaveformProps {
  samples: number[] | null;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function Waveform({
  samples,
  duration,
  currentTime,
  onSeek,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!samples || !samples.length || !duration) {
    // skeleton in your dark-blue palette
    return (
      <div className="relative h-24 overflow-hidden rounded-[22px] border border-[#263040] bg-[#111726] px-4 py-6">
        <div className="flex h-full items-center gap-[2px]">
          {Array.from({ length: 160 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-[#283349]"
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
  const barWidth = 3;
  const gap = 1;
  const totalWidth = totalBars * (barWidth + gap);

  const progress = Math.min(1, Math.max(0, currentTime / duration));
  const playheadLeft = progress * totalWidth;

  return (
    <div
      ref={containerRef}
      className="
        relative h-24
        overflow-x-auto overflow-y-hidden
        rounded-[22px] border border-[#263040]
        bg-[#111726] py-4
      "
    >
      <div
        className="relative flex h-full items-center gap-[2px] px-4"
        style={{ width: `${totalWidth + 8}px` }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const pct = Math.min(1, Math.max(0, x / rect.width));
          onSeek(pct * duration);
        }}
      >
        {/* waveform bars */}
        {samples.map((v, i) => {
          const barPos = (i * (barWidth + gap) + barWidth / 2) / totalWidth;
          const played = barPos <= progress;
          return (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: `${barWidth}px`,
                height: `${10 + v * 90}%`,
                background: played
                  ? 'rgba(0, 214, 214, 0.95)' // bright cyan
                  : 'rgba(57, 87, 122, 0.85)', // darker blue for unplayed
              }}
            />
          );
        })}

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-1 w-[2px] rounded-full bg-white/95 shadow-[0_0_14px_rgba(255,255,255,0.8)]"
          style={{ left: `${playheadLeft}px` }}
        />
      </div>
    </div>
  );
}
