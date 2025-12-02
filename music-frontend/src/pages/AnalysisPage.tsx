// src/pages/AnalysisPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getResult, getStatus } from '../lib/api';
import React from 'react';
import { AnalysisResult, StemName, StatusInfo } from '../types/analysis';
import AnalysisLoading from '../components/analysis/AnalysisLoading';
// import { MasterPlayer } from '../components/analysis/MasterPlater';
// import { StemGrid } from '../components/analysis/StemGrid';
// import { MetadataHeader } from '../components/analysis/MetaHeader';
import { DawAnalysisView } from '../components/daw/DawAnalysisView';
type LoadState = 'idle' | 'loading' | 'polling' | 'ready' | 'error';

type WaveformSource =
  | { kind: 'master'; path?: string | null }
  | { kind: 'stem'; name: StemName; path?: string | null };

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
  const [waveformSource, setWaveformSource] = useState<WaveformSource | null>(
    null,
  );

  // Poll backend for status/result
  useEffect(() => {
    if (!taskId) {
      setError('No task id provided');
      setLoadState('error');
      return;
    }

    let cancelled = false;
    let pollTimer: number | undefined;

    // adaptive backoff
    let attempts = 0;

    const poll = async () => {
      try {
        setLoadState((prev) => (prev === 'loading' ? 'loading' : 'polling'));
        const status = await getStatus(taskId);
        const info = status.info ?? { status: '' };
        setStatusInfo(info as StatusInfo);

        if (info.partial) {
          // merge partial into result so UI can preview incoming fields
          setResult((prev) => ({ ...(prev ?? {}), ...(info.partial as any) } as AnalysisResult));
        }

        if (cancelled) return;

        if (status.state === 'SUCCESS') {
          const res = await getResult(taskId);
          if (cancelled) return;

          setResult(res);
          setLoadState('ready');
          setError(null);
          return;
        }

        if (status.state === 'FAILURE') {
          setError('Analysis failed on server');
          setLoadState('error');
          return;
        }

        // still running – schedule next poll with exponential backoff
        attempts += 1;
        const next = Math.min(5000, Math.round(1000 * Math.pow(1.5, attempts)));
        pollTimer = window.setTimeout(poll, next);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError('Failed to reach analysis server');
          setLoadState('error');
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
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
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8 text-slate-100">
        <div className="text-sm text-slate-400">Analyzing track… this can take a minute depending on length.</div>
        {/* Use the new loading component which shows progress and partials */}
        <div className="mt-4">
          <React.Suspense fallback={<div>Preparing analysis…</div>}>
            <AnalysisLoading status={statusInfo ?? undefined} partial={result ?? undefined} />
          </React.Suspense>
        </div>
      </main>
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
  // return (
  //   <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8 text-slate-100">
  //     {/* top metadata cards */}
  //     <MetadataHeader metadata={result.metadata} />

  //     {/* master / stem waveform + chords */}
  //     <MasterPlayer
  //       audioPath={
  //         waveformSource.kind === 'master'
  //           ? waveformSource.path ?? masterPath
  //           : waveformSource.path ?? masterPath
  //       }
  //       chords={result.chords}
  //       isStemSource={isStemSource}
  //       stemLabel={isStemSource ? waveformSource.name : undefined}
  //       notes={result.notes}                   // 👈 NEW
  //       onShowMaster={
  //         isStemSource
  //           ? () =>
  //               setWaveformSource({
  //                 kind: 'master',
  //                 path: masterPath,
  //               })
  //           : undefined
  //       }
  //     />

  //     {/* stems grid */}
  //     <StemGrid
  //       stems={result.stems}
  //       onStemSelect={(name, path) =>
  //         setWaveformSource({ kind: 'stem', name, path })
  //       }
  //     />
  //   </main>
  // );
}
