import { NoteEvent } from '../types/analysis';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteName(pitch: number): string {
  if (!Number.isFinite(pitch)) return '-';
  const name = NOTE_NAMES[pitch % 12];
  const octave = Math.floor(pitch / 12) - 1;
  return `${name}${octave}`;
}

/**
 * Given a time and a list of note events, return the active note (if any).
 */
export function getNoteAtTime(
  t: number,
  notes: NoteEvent[] | undefined,
): NoteEvent | null {
  if (!notes || !notes.length) return null;
  // Simple linear scan – good enough; if needed we can binary-search later.
  for (const n of notes) {
    if (t >= n.start && t <= n.end) {
      return n;
    }
  }
  return null;
}
