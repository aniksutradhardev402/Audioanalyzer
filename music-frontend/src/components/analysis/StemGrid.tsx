import { StemsMap } from '../../types/analysis';
import { StemCard } from './StemCard';

interface Props {
  stems: StemsMap;
}

export function StemGrid({ stems }: Props) {
  return (
    <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/70">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Track Source (click stem to play)
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StemCard stemName="vocals" path={stems.vocals} />
        <StemCard stemName="drums" path={stems.drums} />
        <StemCard stemName="bass" path={stems.bass} />
        <StemCard stemName="piano" path={stems.piano} />
        <StemCard stemName="guitar" path={stems.guitar} />
        <StemCard stemName="other" path={stems.other} />
      </div>
    </section>
  );
}
