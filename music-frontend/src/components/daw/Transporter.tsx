import React from 'react';

interface TransportBarProps {
  bpm?: number;
  keyName?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackRate: number;
  onChangePlaybackRate: (value: number) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  bpm,
  keyName,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  playbackRate,
  onChangePlaybackRate,
}) => {
  const format = (t: number) => {
    if (!Number.isFinite(t)) return '00:00.0';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const tenths = Math.floor((t * 10) % 10);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${tenths}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <header className="flex items-center gap-6 border-b border-slate-900 bg-[#05080f] px-5 py-3 text-xs text-slate-200">
      {/* Play / title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00d6d6] text-slate-900 shadow-[0_0_18px_rgba(0,214,214,0.6)]"
        >
          {isPlaying ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>
        <div className="flex flex-col text-[11px]">
          <span className="font-semibold tracking-wide">SonicLab Session</span>
          <span className="text-slate-400">DAW view</span>
        </div>
      </div>

      {/* BPM / Key */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="rounded-full bg-[#121826] px-3 py-1">
          <span className="mr-1 text-slate-400">BPM</span>
          <span className="font-semibold">{bpm ?? '--'}</span>
        </div>
        <div className="rounded-full bg-[#121826] px-3 py-1">
          <span className="mr-1 text-slate-400">Key</span>
          <span className="font-semibold">{keyName ?? '--'}</span>
        </div>
      </div>

      {/* playback speed */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-slate-400">Speed</span>
        <div className="flex items-center gap-[2px] rounded-full bg-[#111827] px-1 py-[2px]">
          {speedOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangePlaybackRate(s)}
              className={`rounded-full px-2 py-[1px] ${
                s === playbackRate
                  ? 'bg-[#00d6d6] text-[#020617]'
                  : 'text-slate-300 hover:bg-[#1f2937]'
              }`}
            >
              {s.toFixed(s === 1 ? 0 : 2)}x
            </button>
          ))}
        </div>
      </div>

      {/* Time display */}
      <div className="ml-auto rounded-full bg-[#121826] px-4 py-1 text-[11px]">
        {format(currentTime)} / {format(duration)}
      </div>
    </header>
  );
};
