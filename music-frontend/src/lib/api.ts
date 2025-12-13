import axios from 'axios';
import {
  AnalysisResult,
  StatusResponse,
  UploadResponse,
} from '../types/analysis';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
});

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await client.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function getStatus(taskId: string): Promise<StatusResponse> {
  const { data } = await client.get<StatusResponse>(`/status/${taskId}`);
  return data;
}

export async function getResult(taskId: string): Promise<AnalysisResult> {
  const { data } = await client.get<AnalysisResult>(`/result/${taskId}`);
  return data;
}

/**
 * Build a usable URL for audio files.
 * Backend serves audio at /files/<path>, where path is usually "results/...".
 * This helper MUST be used for ALL audio srcs.
 */
export function getFileUrl(path: string | undefined | null): string | null {
  if (!path) return null;

  // Normalise
  let raw = path.trim().replace(/\\/g, '/');

  // Already absolute?
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // Remove leading slash
  if (raw.startsWith('/')) raw = raw.slice(1);

  // Make sure it goes through /files/
  if (!raw.startsWith('files/')) {
    raw = `files/${raw}`;
  }

  return `${API_BASE_URL}/${raw}`;
}
