import { AnalysisResult } from '../types/analysis';

export const mockAnalysisResult: AnalysisResult = {
  song_id: 'mock-song-001',

  metadata: {
    bpm: 157,
    duration_seconds: 180,
    estimated_key: 'D minor',
    loudness_rms: 0.622,
    brightness_spectral_centroid: 1729,
  },

  chords: [
    { start_time: 0, end_time: 12, chord_name: 'Gm' },
    { start_time: 12, end_time: 24, chord_name: 'Dm' },
    { start_time: 24, end_time: 36, chord_name: 'Bb' },
    { start_time: 36, end_time: 48, chord_name: 'F' },
    { start_time: 48, end_time: 60, chord_name: 'Gm' },
    { start_time: 60, end_time: 72, chord_name: 'Dm' },
    { start_time: 72, end_time: 96, chord_name: 'Cmaj7' },
    { start_time: 96, end_time: 120, chord_name: 'Am' },
    { start_time: 120, end_time: 150, chord_name: 'Dm' },
    { start_time: 150, end_time: 180, chord_name: 'Gm' },
  ],

  notes: {
    vocals: [],
    bass: [],
    other: [],
  },

stems: {
   
  vocals: 'mock/vocals.wav',   // 👈 must match file name exactly
  drums: 'mock/drums.wav',
  bass: 'mock/bass.wav',
  piano: 'mock/piano.wav',
  guitar: 'mock/guitar.wav',
  other: 'mock/other.wav',
  },
};
