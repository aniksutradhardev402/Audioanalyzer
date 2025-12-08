// src/pages/AnalysisPage.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DawAnalysisView } from '../components/daw/DawAnalysisView';
import { AnalysisLoading } from '../components/analysis/AnalysisLoading';
import { useUploadAndAnalyze } from '../hooks/useUploadAndAnalyze';

export function AnalysisPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { state, pollTask } = useUploadAndAnalyze();
  const { isProcessing, statusMessage, progress = 0, partial, result, error } = state;

  // Poll backend for status/result
  useEffect(() => {
    if (!taskId) {
      console.error('No task id provided, navigating home.');
      navigate('/');
      return;
    }

    // This check prevents re-kicking the polling if we just came from the upload page
    if (state.taskId !== taskId) {
      pollTask(taskId);
    }
  }, [taskId, navigate, pollTask, state.taskId]);

  if (isProcessing || !result) {
    return (
      <AnalysisLoading progress={progress} step={statusMessage} partial={partial} />
    );
  }

  if (error || !result) {
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
