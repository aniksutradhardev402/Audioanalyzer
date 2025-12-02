import React from 'react';

interface WaveStripProps {
  samples: number[] | null;
  duration: number;
  currentTime: number;
  onSeek?: (time: number) => void;
  height?: number;
  active?: boolean;
}

export const WaveStrip: React.FC<WaveStripProps> = ({
  samples,
  duration,
  currentTime,
  onSeek,
  height = 40,
  active = false,
}) => {
  if (!samples || !samples.length || !duration) {
    return (
      <div
        className="w-full rounded-md bg-[#0b101a]"
        style={{ height }}
      >
        <div className="flex h-full items-center gap-[1px] px-2">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-[#1f2937]"
              style={{
                height: `${30 + 40 * Math.abs(Math.sin(i * 0.3))}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const totalBars = samples.length;
  const barWidth = 2;
  const gap = 1;
  const totalWidth = totalBars * (barWidth + gap);

  const progress = Math.min(1, Math.max(0, currentTime / duration));
  const playheadLeft = progress * totalWidth;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!onSeek || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-md ${
        active ? 'bg-[#05080f]' : 'bg-[#05070d]'
      }`}
      style={{ height }}
      onClick={handleClick}
    >
      <div
        className="relative flex h-full items-center gap-[1px] px-2"
        style={{ width: `${totalWidth + 4}px` }}
      >
        {samples.map((v, i) => {
          const barPos = (i * (barWidth + gap) + barWidth / 2) / totalWidth;
          const played = barPos <= progress;
          const baseColor = active ? '#00d6d6' : '#4b5563';
          const unplayedColor = active ? '#1f2933' : '#111827';
          return (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: `${barWidth}px`,
                height: `${8 + v * 90}%`,
                background: played ? baseColor : unplayedColor,
              }}
            />
          );
        })}

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-1 w-[2px] bg-[#00d6d6] shadow-[0_0_12px_rgba(0,214,214,0.8)]"
          style={{ left: `${playheadLeft}px` }}
        />
      </div>
    </div>
  );
};
