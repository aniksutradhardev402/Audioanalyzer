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
    <header className="flex items-center gap-6 border-4  border-app bg-app-accent-soft px-10 py-5 text-md text-app">
      {/* Play / title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-app-accent text-app shadow-[0_0_18px_rgba(0,214,214,0.6)]"
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
        <div className="flex flex-col text-md">
          <span className="font-semibold tracking-wide">Main-Track</span>
        </div>
      </div>

      {/* BPM / Key */}
      <div className="flex items-center gap-4 text-md">
        <div className=" px-3 py-1">
          <span className="mr-1 text-app">BPM</span>
          <span className="font-bold">{bpm ?? '--'}</span>
        </div>
        <div className="px-3 py-1">
          <span className="mr-1 app-text">Key</span>
          <span className="font-bold">{keyName ?? '--'}</span>
        </div>
      </div>

      {/* playback speed */}
      <div className="flex items-center gap-2 text-md">
        <span className="app-text">Speed</span>
        <div className="flex items-center gap-[4px] px-1 py-[2px]">
          {speedOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangePlaybackRate(s)}
              className={`rounded-r-2xl px-[7px] py-[3px] ${
                s === playbackRate
                  ? 'bg-app-accent-soft text-app font-semibold'
                  : 'text-app-accent hover:bg-gray-900'
              }`}
            >
              {s.toFixed(s === 1 ? 0 : 2)}x
            </button>
          ))}
        </div>
      </div>

      {/* Time display */}
      <div className="ml-auto  px-4 py-1 text-lg app-accent">
        {format(currentTime)} / {format(duration)}
      </div>
    </header>
  );
};
