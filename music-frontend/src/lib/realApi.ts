import axios from 'axios';
import {
  AnalysisResult,
  StatusResponse,
  UploadResponse,
} from '../types/analysis';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ||
  'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
});

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await client.post<UploadResponse>(
    '/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
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

export function getFileUrl(relativePath?: string): string | null {
  if (!relativePath) return null;
  return `${API_BASE_URL}/${relativePath.replace(/\\/g, '/')}`;
}
