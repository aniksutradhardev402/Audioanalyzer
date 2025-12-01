import { AudioAnalysisData } from '../../hooks/useAudioAnalyzer';

interface Props {
  analysis: AudioAnalysisData;
}

export function MiniSpectrum({ analysis }: Props) {
  const freq = analysis.frequency;

  if (!freq) {
    return (
      <div className="flex h-10 items-end gap-[2px] overflow-hidden rounded-lg bg-slate-950/70 px-2 py-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-slate-600/60"
            style={{
              height: `${30 + 40 * Math.abs(Math.sin(i * 0.6))}%`,
            }}
          />
        ))}
      </div>
    );
  }

  const bars = 24;
  const step = Math.max(1, Math.floor(freq.length / bars));

  const samples = Array.from({ length: bars }).map((_, i) => {
    const idx = i * step;
    return freq[idx] / 255;
  });

  return (
    <div className="flex h-10 items-end gap-[2px] overflow-hidden rounded-lg bg-slate-950/70 px-2 py-2">
      {samples.map((v, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-cyan-400/80"
          style={{
            height: `${10 + v * 80}%`,
            opacity: 0.4 + v * 0.6,
          }}
        />
      ))}
    </div>
  );
}
