import { AnalyzerState } from '../hooks/useAudioAnalyzer';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function detectNoteFromAnalysis(analysis: AnalyzerState): string | null {
  const { frequency, sampleRate } = analysis;
  if (!frequency || !sampleRate) return null;

  let maxVal = 0;
  let maxIdx = -1;

  for (let i = 1; i < frequency.length; i++) {
    const v = frequency[i];
    if (v > maxVal) {
      maxVal = v;
      maxIdx = i;
    }
  }

  if (maxIdx <= 0) return null;

  const binFreq = (maxIdx * sampleRate) / (2 * frequency.length); // freqBinCount = fftSize/2
  if (!Number.isFinite(binFreq) || binFreq <= 20) return null;

  const A4 = 440;
  const n = Math.round(12 * Math.log2(binFreq / A4));
  const midi = n + 69;
  if (midi < 0 || midi > 127) return null;

  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}
