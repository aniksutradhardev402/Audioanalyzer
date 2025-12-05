import { AnalyzerState } from '../../hooks/useAudioAnalyzer';

interface MiniWaveformProps {
  analysis: AnalyzerState;
}

export function MiniWaveform({ analysis }: MiniWaveformProps) {
  const td = analysis.timeDomain;

  if (!td) {
    return (
      <div className="flex h-10 items-center gap-[2px] overflow-hidden rounded-lg bg-app-elevated/70 px-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-app-elevated/70"
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
        ${analysis.isPlaying ? 'bg-app-elevated/80 shadow-lg' : 'bg-app-elevated/60'}
      `}
    >
      {samples.map((v, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: `${10 + v * 90}%`,
            background: analysis.isPlaying
              ? 'var(--color-accent)'
              : 'var(--color-fg-muted)',
            opacity: 0.5 + v * 0.5,
          }}
        />
      ))}
    </div>
  );
}
