import { useRef } from 'react';
import { StemName } from '../../types/analysis';
import { getFileUrl } from '../../lib/api';
import { useAudioAnalyzer, AnalyzerState } from '../../hooks/useAudioAnalyzer';
import { MiniWaveform } from './MiniWaveform';

interface Props {
  stemName: StemName;
  path?: string;
}

const LABELS: Record<StemName, string> = {
  vocals: 'Vocals',
  drums: 'Drums',
  bass: 'Bass',
  piano: 'Piano',
  guitar: 'Guitar',
  other: 'Other',
};

export function StemCard({ stemName, path }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = path ? getFileUrl(path) : null;
  const analysis: AnalyzerState = useAudioAnalyzer(audioRef);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs shadow-md shadow-slate-950/70">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-cyan-300">
            <div className="h-2 w-2 rounded-full bg-current" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-100">
              {LABELS[stemName]}
            </div>
            <div className="text-[11px] text-slate-500">Stem</div>
          </div>
        </div>

        {url && (
          <a
            href={url}
            download
            className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-500 hover:text-cyan-300"
          >
            Download
          </a>
        )}
      </div>

      {/* level bar */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] text-slate-500">Level</span>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-500"
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

      {url ? (
        <audio
          ref={audioRef}
          className="mt-3 w-full"
          src={url}
          controls
          preload="auto"
          crossOrigin="anonymous"
        />
      ) : (
        <p className="mt-3 text-[11px] text-slate-600">
          No audio file available for this stem.
        </p>
      )}
    </div>
  );
}
