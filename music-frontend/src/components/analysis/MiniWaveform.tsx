import { AnalyzerState } from '../../hooks/useAudioAnalyzer';

interface MiniWaveformProps {
  analysis: AnalyzerState;
}

export function MiniWaveform({ analysis }: MiniWaveformProps) {
  const td = analysis.timeDomain;

  if (!td) {
    return (
      <div className="flex h-10 items-center gap-[2px] overflow-hidden rounded-lg bg-slate-950/70 px-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-slate-700/70"
            style={{
              height: `${30 + 30 * Math.abs(Math.sin(i * 0.5))}%`,
            }}
          />
        ))}
      </div>
    );
  }

  const bars = 40;
  const step = Math.max(1, Math.floor(td.length / bars));
  const samples = Array.from({ length: bars }).map((_, i) =>
    Math.abs(td[i * step]),
  );

  return (
    <div
      className={`
        flex h-10 items-center gap-[2px] overflow-hidden rounded-lg px-2
        ${analysis.isPlaying ? 'bg-slate-950/80 shadow-[0_0_12px_rgba(34,211,238,0.45)]' : 'bg-slate-950/60'}
      `}
    >
      {samples.map((v, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: `${10 + v * 90}%`,
            background: analysis.isPlaying
              ? 'rgba(34,211,238,0.95)' // brighter cyan when playing
              : 'rgba(148,163,184,0.8)', // slate when idle
            opacity: 0.5 + v * 0.5,
          }}
        />
      ))}
    </div>
  );
}
