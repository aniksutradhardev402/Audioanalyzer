import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartialResults } from '../../types/analysis';
import { PageShell } from '../layout/PageShell';
import { getFileUrl } from '../../lib/api';

// Assuming your API base URL is http://localhost:5000.
const API_BASE_URL = 'http://localhost:5000'; // You should ideally import this from a config or API utility file.

interface AnalysisLoadingProps {
  progress: number;
  step?: string;
  partial?: PartialResults;
  taskId?: string;
  onCancel: () => void;
}

const getCharacterForStep = (stepMessage?: string, progress?: number) => {
  if (progress && progress >= 100) {
    return { char: '🏆', label: 'Complete!' };
  }

  const lowerStep = stepMessage?.toLowerCase() || '';

  if (lowerStep.includes('bpm') || lowerStep.includes('key') || lowerStep.includes('metadata')) {
    return { char: '🤔', label: 'Thinking...' };
  }
  // This check must come before the more generic 'stem' check
  if (lowerStep.includes('analyzing individual stems')) {
    return { char: '🎶', label: 'Listening...' };
  }
  if (lowerStep.includes('stem')) {
    return { char: '✂️', label: 'Separating...' };
  }
  if (lowerStep.includes('note')) {
    return { char: '🎶', label: 'Listening...' };
  }
  if (lowerStep.includes('chord')) {
    return { char: '🎸', label: 'Strumming...' };
  }

  return { char: '⚙️', label: 'Working...' };
};

export function AnalysisLoading({
  progress,
  step,
  partial,
  taskId,
  onCancel,
}: AnalysisLoadingProps) {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    if (
      !isCancelling &&
      window.confirm(
        'Are you sure you want to cancel the analysis and return to the homepage?',
      )
    ) {
      setIsCancelling(true);
      if (taskId) {
        // Construct the URL directly for the cancel endpoint, as it's not a "file" endpoint.
        const cancelUrl = `${API_BASE_URL}/cancel/${taskId}`;
        if (cancelUrl) {
          try {
            // Explicitly wait for the server to acknowledge the cancellation.
            await fetch(cancelUrl, { method: 'POST' });
            console.log(`Cancellation request for task ${taskId} was sent successfully.`);
          } catch (error) {
            console.error('Failed to send cancellation request:', error);
            alert('The cancellation request could not be sent. The task may continue running on the server.');
          }
        }
      }
      // 1. Call the parent's reset function.
      onCancel();
      // 2. Navigate home, replacing the current history entry.
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    // For debugging: log the entire partial object whenever it changes.
    console.log('AnalysisLoading received partials:', partial);
    if (partial?.metadata) {
      console.log('>>> [DEBUG] Metadata object found:', partial.metadata);
    } else {
      console.log('>>> [DEBUG] Metadata not found in partials object.');
    }
  }, [partial]);

  const character = getCharacterForStep(step, progress);
  const isAnalyzing = progress < 100;

  return (
    <PageShell>
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8 text-app">
      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-slate-300">
            {step || 'Processing audio…'}
          </h2>
          <span className="text-sm font-semibold app-text">{progress}%</span>
        </div>
        <div className="h-2 bg-app-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gray-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pulsing Animation Fallback */}
      {!partial || (Object.keys(partial).length === 0) ? (
        <div className="flex items-center justify-center gap-2 h-32 rounded-3xl border border-app bg-app-elevated">
          <span className="text-sm app-accent">Processing</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 app-text bg-app-accent-soft rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 app-text bg-app-accent-soft rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 app-text  bg-app-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        /* Partial Results Preview */
        <div className="space-y-4">
          {partial.metadata && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated">
              <h3 className="text-xs font-semibold app-text mb-2">Metadata</h3>
              <div className="grid grid-cols-2 gap-2 text-xs app-text">
                <div>BPM: {partial.metadata.bpm ?? '...'}</div>
                <div>Key: {partial.metadata.estimated_key ?? '...'}</div>
                <div>Duration: {partial.metadata.duration_seconds?.toFixed(0) ?? '...'}s</div>
                <div>Loudness: {partial.metadata.loudness_rms?.toFixed(2) ?? '...'} RMS</div>
              </div>
            </div>
          )}

          {partial.stems && Object.keys(partial.stems).length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Stems Separated</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(partial.stems).map(([name, path]) =>
                  path ? (
                    <span key={name} className="px-2 py-1 text-xs app-accent-bg text-app rounded">
                      {name}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {partial.chords && partial.chords.length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Chords Detected ({partial.chords.length})</h3>
              <div className="text-xs app-text-muted">First chord: {partial.chords[0]?.chord_name}</div>
            </div>
          )}

          {partial.notes && Object.keys(partial.notes).length > 0 && (
            <div className="p-4 rounded-lg border border-app bg-app-elevated">
              <h3 className="text-xs font-semibold app-text-muted mb-2">Notes Detected</h3>
              <div className="text-xs app-text-muted">{Object.keys(partial.notes).join(', ')}</div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs app-text-muted">This can take up to a minute depending on track length.</p>

      {isAnalyzing && (
        <div className="text-center mt-6">
          <button
            onClick={handleCancelClick}
            disabled={isCancelling}
            className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-app-bg transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
            aria-label="Cancel analysis and return to homepage"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Analysis'}
          </button>
        </div>
      )}
    </main>

    {/* Animated Character */}
    <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 p-4 bg-app-elevated border border-app rounded-2xl shadow-2xl transition-all animate-bounce">
      <div className="text-5xl" role="img" aria-label={character.label}>
        {character.char}
      </div>
      <div className="text-xs font-semibold text-app-accent">{character.label}</div>
    </div>
    </PageShell>
  );
}
