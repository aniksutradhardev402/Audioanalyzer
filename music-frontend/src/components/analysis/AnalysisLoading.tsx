import { getFileUrl } from '../../lib/api';
import { AnalysisResult, StatusInfo } from '../../types/analysis';

interface Props {
  status?: StatusInfo | null;
  partial?: Partial<AnalysisResult> | null;
}

export function AnalysisLoading({ status, partial }: Props) {
  const progress = status?.progress ?? (partial ? 30 : 0);

  return (
    <section className="mx-auto flex max-w-6xl flex-1 flex-col gap-4 px-4 py-8 text-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Analyzing track…</h2>
          <p className="text-sm text-slate-400 mt-1">{status?.status ?? 'Preparing analysis'}</p>
        </div>
        <div className="text-sm text-slate-300">{progress}%</div>
      </div>

      <div className="w-full rounded-md bg-slate-800/40 h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Show partial metadata if available */}
      {partial?.metadata && (
        <div className="mt-4 rounded-xl border border-slate-800 p-4 bg-slate-900/40">
          <div className="text-xs text-slate-400">Metadata (partial)</div>
          <div className="mt-2 flex gap-4 text-sm">
            <div>BPM: <strong>{(partial.metadata as any).bpm ?? '—'}</strong></div>
            <div>Key: <strong>{(partial.metadata as any).estimated_key ?? '—'}</strong></div>
            <div>Duration: <strong>{(partial.metadata as any).duration_seconds ?? '—'}s</strong></div>
          </div>
        </div>
      )}

      {/* Show stems list if available */}
      {partial?.stems && (
        <div className="mt-4 rounded-xl border border-slate-800 p-4 bg-slate-900/40">
          <div className="text-xs text-slate-400">Stems (detected)</div>
          <ul className="mt-2 text-sm space-y-1">
            {Object.entries(partial.stems as Record<string, string | undefined>)
              .filter(([, v]) => !!v)
              .map(([name, path]) => (
                <li key={name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="text-slate-200">{name}</div>
                  <a
                    className="text-xs text-slate-400 ml-auto"
                    href={getFileUrl(path) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    play
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Replace empty card with a nicer loading animation when we have no partials yet */}
      {!partial && (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-indigo-400 animate-pulse" />
            <div className="h-3 w-3 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '75ms' }} />
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="ml-3 text-sm text-slate-400">Processing — hang tight</div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AnalysisLoading;
