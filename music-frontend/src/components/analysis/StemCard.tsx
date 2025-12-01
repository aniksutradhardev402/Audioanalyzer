import { useRef } from 'react';
import { StemName } from '../../types/analysis';
import { getFileUrl } from '../../lib/api';
import { useAudioAnalyzer, AnalyzerState } from '../../hooks/useAudioAnalyzer';
import { MiniWaveform } from './MiniWaveform';

interface Props {
  stemName: StemName;
  path?: string;
  onSelectWaveform?: (stemName: StemName, path?: string) => void;
}

const LABELS: Record<StemName, string> = {
  vocals: 'Vocals',
  drums: 'Drums',
  bass: 'Bass',
  piano: 'Piano',
  guitar: 'Guitar',
  other: 'Other',
};

export function StemCard({ stemName, path, onSelectWaveform }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = path ? getFileUrl(path) : null;
  const analysis: AnalyzerState = useAudioAnalyzer(audioRef);

  const handleSelectWaveform = () => {
    onSelectWaveform?.(stemName, path);
  };

  return (
    <div
      className="flex cursor-pointer flex-col rounded-2xl border border-[#3b4557] bg-[#3f485a] p-4 text-xs text-[#e4ebff] shadow-[0_18px_30px_rgba(0,0,0,0.7)] transition-colors hover:border-[#00d6d6]"
      onClick={handleSelectWaveform}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#202733] text-[#00d6d6]">
            <div className="h-2 w-2 rounded-full bg-current" />
          </div>
          <div>
            <div className="text-[13px] font-semibold">
              {LABELS[stemName]}
            </div>
            <div className="text-[11px] text-[#c1cadf]/80">
              Click to show in main waveform
            </div>
          </div>
        </div>

        {url && (
          <a
            href={url}
            download
            className="rounded-full border border-[#2d3748] bg-[#202733] px-3 py-1 text-[10px] text-[#dbe5ff] hover:border-[#00d6d6] hover:text-[#00e1e1]"
            onClick={(e) => e.stopPropagation()}
          >
            Download
          </a>
        )}
      </div>

      {/* level bar */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] text-[#c1cadf]/80">Level</span>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#273143]">
            <div
              className="h-full rounded-full bg-[#00d6d6]"
              style={{
                width: `${analysis.isPlaying ? 70 : 40}%`,
                transition: 'width 150ms ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* mini waveform */}
      <div className="mt-4">
        <MiniWaveform analysis={analysis} />
      </div>

      {/* audio controls – stop click from triggering waveform select */}
      {url ? (
        <div
          className="mt-3 rounded-xl border border-[#2a3444] bg-[#151b25] px-3 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <audio
            ref={audioRef}
            className="w-full accent-[#00d6d6]"
            src={url}
            controls
            preload="auto"
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-[#a9b4c9]">
          No audio file available for this stem.
        </p>
      )}
    </div>
  );
}
