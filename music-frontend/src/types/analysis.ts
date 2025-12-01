
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
export interface NoteEvent {
  pitch: number;        // MIDI pitch
  start: number;        // seconds
  end: number;          // seconds
  velocity: number;     // 0..1
}

export type StemsMap = Record<StemName, string | undefined>;

export type NotesByStem = Partial<Record<StemName, NoteEvent[]>>;

export interface AnalysisResult {
  metadata: TrackMetadata;
  chords: ChordEvent[];
   stems: StemsMap;
  song_id: string;
   notes?: Partial<Record<StemName | 'master', NoteEvent[]>>;
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