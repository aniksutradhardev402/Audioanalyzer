// src/hooks/useAudioAnalyzer.tsimport { useCallback, useEffect, useRef, useState } from 'react';
import { AnalysisResult, TaskState } from '../types/analysis';
import { uploadAudio, getStatus, getResult } from '../lib/api';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioAnalysisData {
  timeDomain: Float32Array | null;
  frequency: Uint8Array | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}


// src/hooks/useUploadAndAnalyze.ts


interface UploadState {
  isUploading: boolean;
  isProcessing: boolean;
  taskId?: string;
  statusMessage?: string; // messages related to upload stage (kept short)
  analysisStatus?: string; // messages coming from analysis/polling
  error?: string;
  result?: AnalysisResult; // final result
  partial?: Partial<AnalysisResult> | null; // partial/ongoing data from backend
  progress?: number; // 0..100
}

const BASE_POLL_MS = 1000; // start with 1s
const MAX_POLL_MS = 5000; // never poll more than 5s
const POLL_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export function useUploadAndAnalyze() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    isProcessing: false,
  });

  const pollTimer = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => clearPoll, []);

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

        // schedule next poll with exponential backoff (but cap it)
        attempts += 1;
        const interval = Math.min(MAX_POLL_MS, Math.round(BASE_POLL_MS * Math.pow(1.5, attempts)));
        pollTimer.current = window.setTimeout(poll, interval) as unknown as number;
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
      setState({
        isUploading: true,
        isProcessing: false,
        taskId: undefined,
        statusMessage: undefined,
        error: undefined,
        result: undefined,
      });

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

  return { state, upload };
}

