export interface TrackMetadata {
  bpm: number;
  duration_seconds: number;
  estimated_key: string;
  loudness_rms: number;
  brightness_spectral_centroid: number;
}

export interface ChordEvent {
  start_time: number;
  end_time: number;
  chord_name: string;
  error?: string;
}

export interface NoteEvent {
  start: number;
  end: number;
  pitch: number;
  velocity: number;
}

export type StemName =
  | 'vocals'
  | 'drums'
  | 'bass'
  | 'piano'
  | 'guitar'
  | 'other';

export type StemsMap = Record<StemName, string | undefined>;

export type NotesByStem = Partial<Record<StemName, NoteEvent[]>>;

export interface AnalysisResult {
  metadata: TrackMetadata;
  chords: ChordEvent[];
  notes: NotesByStem;
  stems: StemsMap;
  song_id: string;
}

export interface UploadResponse {
  task_id: string;
  message: string;
}

export type TaskState = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILURE';

export interface StatusResponse {
  task_id: string;
  state: TaskState;
  status: string;
  error?: string;
}