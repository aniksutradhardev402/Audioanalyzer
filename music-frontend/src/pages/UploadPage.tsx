import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { UploadCard } from '../components/upload/UploadCard';
import { FeatureGrid } from '../components/upload/FeatureGrid';
import { useUploadAndAnalyze } from '../hooks/useUploadAndAnalyze';

export function UploadPage() {
  const { state, upload } = useUploadAndAnalyze();
  const navigate = useNavigate();

  const handleFileSelected = async (file: File) => {
    try {
      const taskId = await upload(file);
      // Navigate to analysis view; it will read taskId from URL and refetch if needed.
      navigate(`/track/${taskId}`, { state: { fromUpload: true } });
    } catch {
      // error already handled in hook state
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <UploadCard
          onFileSelected={handleFileSelected}
          isBusy={state.isUploading || state.isProcessing}
          statusMessage={state.statusMessage}
        />
        {state.error && (
          <p className="mt-4 text-center text-xs text-red-400">
            {state.error}
          </p>
        )}
        <FeatureGrid />
      </div>
    </PageShell>
  );
}
