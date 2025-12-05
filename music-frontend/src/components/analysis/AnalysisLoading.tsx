import { PartialResults } from '../../types/analysis';

interface AnalysisLoadingProps {
  progress: number;
  step?: string;
  partial?: PartialResults;
}

export function AnalysisLoading({ progress, step, partial }: AnalysisLoadingProps) {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8 text-app">
      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-slate-300">
            {step || 'Processing audio…'}
          </h2>
          <span className="text-xs app-text-muted">{progress}%</span>
        </div>
        <div className="h-2 bg-app-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pulsing Animation Fallback */}
      {!partial || (Object.keys(partial).length === 0) ? (
        <div className="flex items-center justify-center gap-2 h-32 rounded-3xl border border-app bg-app-elevated/70">
          <span className="text-sm app-text-muted">Processing</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 app-text-muted rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 app-text-muted rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 app-text-muted rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        /* Partial Results Preview */
        <div className="space-y-4">
          {partial.metadata && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated/50">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Metadata</h3>
              <div className="grid grid-cols-2 gap-2 text-xs app-text-muted">
                <div>BPM: {partial.metadata.bpm}</div>
                <div>Key: {partial.metadata.estimated_key}</div>
                <div>Duration: {partial.metadata.duration_seconds}s</div>
                <div>Loudness: {partial.metadata.loudness_rms.toFixed(2)} RMS</div>
              </div>
            </div>
          )}

          {partial.stems && Object.keys(partial.stems).length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated/50">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Stems Separated</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(partial.stems).map(([name, path]) =>
                  path ? (
                    <span
                      key={name}
                      className="px-2 py-1 text-xs app-accent-bg text-app rounded"
                    >
                      {name}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {partial.chords && partial.chords.length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated/50">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Chords Detected ({partial.chords.length})</h3>
              <div className="text-xs app-text-muted">First chord: {partial.chords[0]?.chord_name}</div>
            </div>
          )}

          {partial.notes && Object.keys(partial.notes).length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated/50">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Notes Detected</h3>
              <div className="text-xs app-text-muted">{Object.keys(partial.notes).join(', ')}</div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs app-text-muted">This can take up to a minute depending on track length.</p>
    </main>
  );
}
