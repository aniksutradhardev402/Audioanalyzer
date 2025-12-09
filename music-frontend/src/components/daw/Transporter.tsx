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
  onDownloadClick?: () => void;
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
  onDownloadClick,
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
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-4 border-app bg-app-accent-soft px-4 py-5 text-md text-app md:px-10">
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
        <div className="flex flex-wrap items-center gap-1">
          {speedOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangePlaybackRate(s)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                s === playbackRate
                  ? 'bg-app-accent-soft text-app font-semibold'
                  : 'text-app-accent hover:bg-app-elevated'
              }`}
            >
              {s.toFixed(s === 1 ? 0 : 2)}x
            </button>
          ))}
        </div>
      </div>

      {/* Time display */}
      <div className="w-full text-center text-lg app-accent md:ml-auto md:w-auto md:text-left">
        {format(currentTime)} / {format(duration)}
      </div>

      {onDownloadClick && (
        <button
          onClick={onDownloadClick}
          className="flex items-center gap-2 rounded-md border border-app-accent/50 bg-app-elevated px-3 py-2 text-xs font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Stems</span>
        </button>
      )}
    </header>
  );
};
