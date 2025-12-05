// src/pages/AnalysisPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getResult, getStatus } from '../lib/api';
import { AnalysisResult, StemName, PartialResults } from '../types/analysis';
import { DawAnalysisView } from '../components/daw/DawAnalysisView';
import { AnalysisLoading } from '../components/analysis/AnalysisLoading';

type LoadState = 'idle' | 'loading' | 'polling' | 'ready' | 'error';

type WaveformSource =
  | { kind: 'master'; path?: string | null }
  | { kind: 'stem'; name: StemName; path?: string | null };

const INITIAL_POLL_INTERVAL_MS = 1000; // 1 second
const MAX_POLL_INTERVAL_MS = 30000; // 30 seconds
const POLL_BACKOFF_MULTIPLIER = 1.5;

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [waveformSource, setWaveformSource] = useState<WaveformSource | null>(
    null,
  );

  // Polling state
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Starting analysis…');
  const [partial, setPartial] = useState<PartialResults>({});

  const pollTimer = useRef<number | undefined>(undefined);
  const pollInterval = useRef(INITIAL_POLL_INTERVAL_MS);
  const cancelledRef = useRef(false);

  // Poll backend for status/result
  useEffect(() => {
    if (!taskId) {
      setError('No task id provided');
      setLoadState('error');
      return;
    }

    cancelledRef.current = false;

    const poll = async () => {
      try {
        setLoadState((prev) => (prev === 'loading' ? 'loading' : 'polling'));
        const status = await getStatus(taskId);

        if (cancelledRef.current) return;

        if (status.state === 'SUCCESS') {
          const res = await getResult(taskId);
          if (cancelledRef.current) return;

          setResult(res);
          setProgress(100);
          setLoadState('ready');
          setError(null);
          return;
        }

        if (status.state === 'FAILURE') {
          setError('Analysis failed on server');
          setLoadState('error');
          return;
        }

        // Update progress and partial results from structured status
        if (status.info) {
          if (status.info.progress !== undefined) {
            setProgress(status.info.progress);
          }
          if (status.info.step) {
            setCurrentStep(status.info.step);
          }
          if (status.info.partial) {
            // Merge partial results (don't overwrite)
            setPartial((prev) => ({
              ...prev,
              ...(status.info?.partial || {}),
            }));
          }
        }

        // Reset interval to fast track when progressing
        pollInterval.current = INITIAL_POLL_INTERVAL_MS;

        // Schedule next poll
        pollTimer.current = window.setTimeout(poll, pollInterval.current);
      } catch (e) {
        console.error(e);
        if (!cancelledRef.current) {
          // Exponential backoff on error
          pollInterval.current = Math.min(
            pollInterval.current * POLL_BACKOFF_MULTIPLIER,
            MAX_POLL_INTERVAL_MS,
          );
          pollTimer.current = window.setTimeout(poll, pollInterval.current);
        }
      }
    };

    poll();

    return () => {
      cancelledRef.current = true;
      if (pollTimer.current) window.clearTimeout(pollTimer.current);
    };
  }, [taskId]);

  // When result arrives, initialise waveform source to master (vocals/other)
  useEffect(() => {
    if (!result) return;

    const masterPath =
      result.stems.vocals ||
      result.stems.other ||
      null;

    setWaveformSource({ kind: 'master', path: masterPath });
  }, [result]);

  if (loadState === 'loading' || loadState === 'polling') {
    return (
      <AnalysisLoading progress={progress} step={currentStep} partial={partial} />
    );
  }

  if (loadState === 'error' || !result || !waveformSource) {
    return (
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-4 px-4 py-8 text-slate-100">
        <h1 className="text-lg font-semibold text-slate-100">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-400">
          {error || 'Unable to load analysis result.'}
        </p>
      </main>
    );
  }

  return <DawAnalysisView result={result} />;
}
