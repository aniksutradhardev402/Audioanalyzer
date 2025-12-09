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
        className="w-full  bg.app-accent-soft"
        style={{ height }}
      >
        <div className="flex h-full items-center gap-[1px] px-2">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-app-elevated"
              style={{
                height: `${30 + 40 * Math.abs(Math.sin(i * 0.3))}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const progress = Math.min(1, Math.max(0, currentTime / duration));
  const playheadLeftPct = progress * 100;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!onSeek || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${
        active ? 'bg-app' : 'bg-app'
      }`}
      style={{ height }}
      onClick={handleClick}
    >
      <div
        className="relative flex h-full w-full items-center"
      >
        {samples.map((v, i) => {
          const barProgress = i / samples.length;
          const played = barProgress < progress;
          const baseColor = active ? 'var(--color-accent)' : 'var(--color-accent)';
          const unplayedColor = active ? 'var(--color-accent-soft)' : 'var(--color-accent-soft)';
          return (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${8 + v * 90}%`,
                background: played ? baseColor : unplayedColor,
              }}
            />
          );
        })}

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-1 w-[2px] bg-red-500 shadow-[0_0_12px_rgba(0,214,150,0.8)]"
          style={{ left: `${playheadLeftPct}%` }}
        />
      </div>
    </div>
  );
};
