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

  

    const poll = async () => {
      try {
        const status = await getStatus(taskId);
        const stateVal = status.state as TaskState;
        if (stateVal === 'SUCCESS') {
          clearPoll();
          const result = await getResult(taskId);
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            statusMessage: 'Analysis complete',
            result,
          }));
          return;
        }
        if (stateVal === 'FAILURE') {
          clearPoll();
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: status.error || 'Something went wrong during analysis.',
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
    pollTimer.current = window.setInterval(poll, POLL_INTERVAL_MS);
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
