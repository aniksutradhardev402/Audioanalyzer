import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalysisResult, TaskState, PartialResults } from '../types/analysis';
import { uploadAudio, getStatus, getResult } from '../lib/api';

export interface AudioAnalysisData {
  timeDomain: Float32Array | null;
  frequency: Uint8Array | null;
  sampleRate: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}


// src/hooks/useUploadAndAnalyze.ts


interface UploadState {
  isUploading: boolean;
  isProcessing: boolean;
  progress?: number;
  taskId?: string;
  statusMessage?: string; // messages related to upload stage (kept short)
  analysisStatus?: string; // messages coming from analysis/polling
  error?: string;
  partial?: PartialResults;
  result?: AnalysisResult;
}

const initialState: UploadState = {
  isUploading: false,
  isProcessing: false,
  progress: 0,
  taskId: undefined,
  statusMessage: undefined,
  error: undefined,
  partial: undefined,
  result: undefined,
};

const POLL_INTERVAL_MS = 20000;
const POLL_TIMEOUT_MS = 20 * 60 * 500;

export function useUploadAndAnalyze() {
  const [state, setState] = useState<UploadState>(initialState);

  const pollTimer = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => clearPoll, []);

  const reset = useCallback(() => {
    clearPoll();
    setState(initialState);
  }, []);

  const startPolling = useCallback((taskId: string) => {
    startTimeRef.current = Date.now();

    // adaptive / exponential backoff polling loop using setTimeout so we can change intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getStatus(taskId);
        const stateVal = status.state as TaskState;

        // Normalized info object may contain more structured progress/partial data
        const info = status.info ?? { status: '' };

        // When the backend reports a partial result we keep it in state so the UI can show it
        if (info.partial) {
          setState((prev) => ({ ...prev, partial: info.partial }));
        }

        if (typeof info.progress === 'number') {
          setState((prev) => ({ ...prev, progress: info.progress }));
        }

        // Keep upload/statusMessage focused on upload stage. analysisStatus will be used for
        // analysis-specific messages so UploadCard doesn't display the full processing log.
        setState((prev) => ({
          ...prev,
          isProcessing: stateVal !== 'SUCCESS' && stateVal !== 'FAILURE',
          analysisStatus: info.status ?? prev.analysisStatus,
        }));

        if (stateVal === 'SUCCESS') {
          clearPoll();
          const result = await getResult(taskId);
          setState((prev) => ({ ...prev, isProcessing: false, result, progress: 100 }));
          return;
        }

        if (stateVal === 'FAILURE') {
          clearPoll();
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: info.error || 'Something went wrong during analysis.',
          }));
          return;
        }

        const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
        if (elapsed > POLL_TIMEOUT_MS) {
          clearPoll();
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error:
              'Processing timeout. The track took too long to analyze. Try a shorter file.',
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          isProcessing: true,
          progress: status.info?.progress,
          partial: {
            ...prev.partial,
            ...status.info?.partial,
          },
          statusMessage: status.status,
        }));
      } catch (err) {
        console.error(err);
        clearPoll();
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error:
            'Network error while checking status. Make sure the backend is running.',
        }));
      }
    };

    // initial kick-off
    poll();
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setState({ ...initialState, isUploading: true, statusMessage: 'Uploading file...' });

      try {
        const resp = await uploadAudio(file);
        setState((prev) => ({
          ...prev,
          isUploading: false,
          isProcessing: true,
          taskId: resp.task_id,
          statusMessage: 'Upload complete. Starting analysis…',
        }));
        startPolling(resp.task_id);
        return resp.task_id;
      } catch (e) {
        console.error(e);
        setState((prev) => ({
          ...prev,
          isUploading: false,
          isProcessing: false,
          error:
            'Failed to upload. Check backend server or file size/format and try again.',
        }));
        throw e;
      }
    },
    [startPolling],
  );

  const pollTask = useCallback(
    (taskId: string) => {
      setState({
        progress: 0,
        isUploading: false,
        isProcessing: true,
        taskId: taskId,
        statusMessage: 'Checking analysis status…',
        error: undefined,
        partial: undefined,
        result: undefined,
      });
      startPolling(taskId);
    },
    [startPolling],
  );

  return { state, upload, pollTask, reset };
}
