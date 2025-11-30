/**
 * This file contains mock data that simulates the output of the audio analysis backend.
 * It's used for frontend development and testing without needing to run the full backend process.
 */

export const MOCK_RESULT_DATA = {
  song_id: "Awaargi - 1 Min Music - Aditya A",
  metadata: {
    bpm: 123.05,
    duration_seconds: 61.54,
    estimated_key: "F major",
    loudness_rms: 0.12,
  },
  bpm: 123.05,
  key_estimation: {
    key: "F",
    scale: "major",
    strength: 0.91,
  },
  chords_estimation: {
    progression: "C - F",
    chords: [
      { chord: "C", start_time: 0.0, end_time: 0.89 },
      { chord: "F", start_time: 0.89, end_time: 2.14 },
      // Adding a few more for variety in testing
      { chord: "C", start_time: 2.14, end_time: 3.5 },
      { chord: "G", start_time: 3.5, end_time: 4.8 },
      { chord: "Am", start_time: 4.8, end_time: 6.0 },
    ],
  },
  separated_stems: {
    bass: "results/mock_task_id/bass.wav",
    drums: "results/mock_task_id/drums.wav",
    guitar: "results/mock_task_id/guitar.wav",
    other: "results/mock_task_id/other.wav",
    piano: "results/mock_task_id/piano.wav",
    vocals: "results/mock_task_id/vocals.wav",
  },
  notes: {
    bass: [
      {
        end: 57.609,
        pitch: 60,
        start: 57.458,
        velocity: 0.35,
      },
      {
        end: 56.367,
        pitch: 55,
        start: 56.193,
        velocity: 0.43,
      },
      {
        end: 56.332,
        pitch: 65,
        start: 56.007,
        velocity: 0.5,
      },
      {
        end: 54.288,
        pitch: 38,
        start: 53.812,
        velocity: 0.55,
      },
      {
        end: 54.137,
        pitch: 50,
        start: 53.777,
        velocity: 0.44,
      },
      {
        end: 52.696,
        pitch: 29,
        start: 51.929,
        velocity: 0.53,
      },
      {
        end: 52.046,
        pitch: 53,
        start: 51.848,
        velocity: 0.37,
      },
      {
        end: 44.575,
        pitch: 70,
        start: 44.378,
        velocity: 0.64,
      },
      {
        end: 43.332,
        pitch: 65,
        start: 43.088,
        velocity: 0.59,
      },
      {
        end: 35.188,
        pitch: 82,
        start: 34.863,
        velocity: 0.54,
      },
    ],
    // You could add more instruments here like 'piano', 'guitar', etc.
    piano: [
        {
            "start": 10.5,
            "end": 10.8,
            "pitch": 72, // C5
            "velocity": 0.8
        },
        {
            "start": 10.8,
            "end": 11.1,
            "pitch": 76, // E5
            "velocity": 0.8
        }
    ]
  },
};