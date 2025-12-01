import { mockAnalysisResult } from './analysis.mock';
import {
  UploadResponse,
  StatusResponse,
  AnalysisResult,
} from '../types/analysis';

let fakeTaskId = 'mock-task-123';
let startTime = Date.now();

export async function mockUpload(): Promise<UploadResponse> {
  startTime = Date.now();
  return {
    task_id: fakeTaskId,
    message: 'Mock upload successful',
  };
}

export async function mockStatus(): Promise<StatusResponse> {
  const elapsed = Date.now() - startTime;

  if (elapsed < 2000) {
    return {
      task_id: fakeTaskId,
      state: 'PENDING',
      status: 'Queued for processing',
    };
  }

  if (elapsed < 5000) {
    return {
      task_id: fakeTaskId,
      state: 'PROCESSING',
      status: 'Analyzing audio…',
    };
  }

  return {
    task_id: fakeTaskId,
    state: 'SUCCESS',
    status: 'Analysis complete',
  };
}

export async function mockResult(): Promise<AnalysisResult> {
  return mockAnalysisResult;
}
