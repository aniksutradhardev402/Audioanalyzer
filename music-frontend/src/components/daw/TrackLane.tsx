import React from 'react';
import { StemName } from '../../types/analysis';
import { WaveStrip } from './Wavestrip';

interface TrackLaneProps {
  name: string;
  stemName: StemName | 'master';
  isActive: boolean;
  duration: number;
  currentTime: number;
  waveformSamples: number[] | null;
  volume: number; // 0–1
  onClick: () => void;
  onVolumeChange: (value: number) => void;
  onSeek: (time: number) => void;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  name,
  stemName,
  isActive,
  duration,
  currentTime,
  waveformSamples,
  volume,
  onClick,
  onVolumeChange,
  onSeek,
}) => {
  return (
    <div
      className={`flex h-24 cursor-pointer flex-col border-b border-slate-900 px-4 py-2 text-xs text-slate-100 ${
        isActive ? 'bg-[#141b26]' : 'bg-[#090f18]'
      } hover:bg-[#131a25]`}
      onClick={onClick}
    >
      {/* header row: icon + name + volume */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c2433] text-[10px] text-slate-200">
          {stemName === 'master' ? 'M' : stemName[0].toUpperCase()}
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold">{name}</span>
            <span className="text-[10px] text-slate-500">Fx</span>
          </div>

          {/* volume slider */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-slate-500">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-[#00d6d6]"
            />
          </div>
        </div>
      </div>

      {/* TRACK GRID + EXISTING WAVEFORM */}
      <div
        className="relative mt-1 flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* grid background (like DAW lanes) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(8,16,24,0.85) 0%, rgba(8,16,24,0.9) 50%, rgba(5,7,12,0.95) 50%, rgba(5,7,12,1) 100%), repeating-linear-gradient(to right, #111827 0px, #111827 1px, #020617 1px, #020617 16px)',
            backgroundBlendMode: 'normal',
          }}
        />

        {/* scrollable content with waveform */}
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-md">
          <div className="flex-1 overflow-x-auto">
            <WaveStrip
              samples={waveformSamples}
              duration={duration}
              currentTime={currentTime}
              onSeek={onSeek}
              height={36}
              active={isActive}
            />
          </div>

          {/* tiny faux horizontal scrollbar like in your screenshot */}
          <div className="mt-1 h-2 px-1 pb-[2px]">
            <div className="h-[3px] rounded-full bg-[#111827]">
              <div className="h-full w-1/3 rounded-full bg-[#6b7280]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
