// src/components/analysis/StemGrid.tsx
import { StemName } from '../../types/analysis';
import { StemCard } from './StemCard';

interface StemGridProps {
  stems: Record<StemName, string | undefined>;
  onStemSelect?: (name: StemName, path?: string) => void;
}

export function StemGrid({ stems, onStemSelect }: StemGridProps) {
  const entries = Object.entries(stems) as [StemName, string | undefined][];

  return (
    <section className="mt-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Track Source (click stem to show in master waveform)
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(([name, path]) => (
          <StemCard
            key={name}
            stemName={name}
            path={path}
            onSelectWaveform={onStemSelect}
          />
        ))}
      </div>
    </section>
  );
}
