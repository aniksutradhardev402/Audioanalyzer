import { ChordEvent } from '../types/analysis';

export function condenseChords(chords: ChordEvent[]): ChordEvent[] {
  if (!chords.length) return [];
  const out: ChordEvent[] = [];
  for (const c of chords) {
    const last = out[out.length - 1];
    if (last && last.chord_name === c.chord_name) {
      last.end_time = c.end_time;
    } else {
      out.push({ ...c });
    }
  }
  return out;
}

export function getDistinctChordNames(chords: ChordEvent[]): string[] {
  const set = new Set<string>();
  for (const c of chords) set.add(c.chord_name);
  return Array.from(set);
}
