import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { MetadataHeader } from '../components/analysis/MetaHeader';
// import { Waveform } from '../components/analysis/Waveform';
// import { ChordTimeline } from '../components/analysis/ChordTimeline';
// import { PlayerBar } from '../components/analysis/PlayerBar';
import { MasterPlayer } from '../components/analysis/MasterPlater';
import { StemGrid } from '../components/analysis/StemGrid';
import { AnalysisResult } from '../types/analysis';
import { getResult, getStatus } from '../lib/api';
import { getFileUrl } from '../lib/api';
// import { apiResult, apiStatus } from '../lib/api';



type LoadState = 'idle' | 'loading' | 'error' | 'processing';

export function AnalysisPage() {
  const { taskId } = useParams();
  const location = useLocation();
  const [state, setState] = useState<{
    loadState: LoadState;
    result?: AnalysisResult;
    message?: string;
  }>({
    loadState: 'loading',
  });

  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;

    const load = async () => {
      try {
        const res = await getResult(taskId);
        if (!isMounted) return;
        setState({ loadState: 'idle', result: res });
      } catch {
        // maybe still processing – ask status
        try {
          const status = await getStatus(taskId);
          if (!isMounted) return;

          if (status.state === 'SUCCESS') {
            const res = await getResult(taskId);
            if (!isMounted) return;
            setState({ loadState: 'idle', result: res });
          } else if (status.state === 'PROCESSING' || status.state === 'PENDING') {
            setState({
              loadState: 'processing',
              message:
                status.status ||
                'Your track is still being analyzed. This can take a few minutes.',
            });
          } else {
            setState({
              loadState: 'error',
              message: status.error || 'Analysis failed.',
            });
          }
        } catch {
          if (!isMounted) return;
          setState({
            loadState: 'error',
            message:
              'Could not load analysis result. Make sure the backend is running.',
          });
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [taskId, location.state]);

  return (
    <PageShell>
      {!taskId && (
        <p className="text-sm text-red-400">No task id provided in URL.</p>
      )}

      {state.loadState === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-20 text-sm text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p>Loading analysis…</p>
        </div>
      )}

      {state.loadState === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-20 text-sm text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p>{state.message}</p>
          <Link
            to="/"
            className="mt-4 text-xs text-cyan-400 underline underline-offset-4"
          >
            Go back to upload
          </Link>
        </div>
      )}

      {state.loadState === 'error' && (
        <div className="py-16 text-center text-sm text-red-400">
          <p>{state.message}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-xs text-cyan-400 underline underline-offset-4"
          >
            Back to upload
          </Link>
        </div>
      )}

  {state.loadState === 'idle' && state.result && (
  <>
    <MetadataHeader metadata={state.result.metadata} />

    <MasterPlayer
      audioPath={
        state.result.stems.vocals ||
        state.result.stems.other ||
        undefined
      }
      chords={state.result.chords}
    />

    <StemGrid stems={state.result.stems} />
  </>
  )}
    </PageShell>
  );
}
