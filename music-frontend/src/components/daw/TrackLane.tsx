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
      className={`flex h-30 mt-4 cursor-pointer  flex-col border-t border-b border-app px-2 py-2 text-sm text-app ${
        isActive ? 'bg-app-accent-soft' : 'bg-app-elevated'
      } hover:bg-[#1e2022]`}
      onClick={onClick}
    >
      {/* header row: icon + name + volume */}
      <div className="mb-2 flex items-center gap-3">
      
        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-md app-accent font-semibold">{name}</span>
            <span className="text-[10px] text-app">Fx</span>
          </div>

          {/* volume slider */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
          
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer "
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

      
        </div>
      </div>
    </div>
  );
};
