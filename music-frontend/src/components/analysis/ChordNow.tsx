import { ChordDiagramCard } from './ChordDiagramCard';

interface ChordNowProps {
  activeChord: string | null;
  distinctChords: string[];
  onSelectChord: (chordName: string) => void;
}

export function ChordNow({
  activeChord,
  distinctChords,
  onSelectChord,
}: ChordNowProps) {
  if (!distinctChords.length) {
    return (
      <div className="mt-4 rounded-2xl bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
        Chord detection unavailable for this track.
      </div>
    );
  }

  const current =
    activeChord && distinctChords.includes(activeChord)
      ? activeChord
      : distinctChords[0];

  return (
    <div className="mt-4 rounded-3xl bg-slate-950/70 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Chord Diagrams
      </div>

      {/* big current chord in the middle */}
      <div className="mb-3 flex justify-center">
        <ChordDiagramCard
          name={current}
          active
          size="lg"
          onClick={() => onSelectChord(current)}
        />
      </div>

      {/* strip of all distinct chords, chips style */}
      <div className="flex flex-wrap gap-2">
        {distinctChords.map((name) => (
          <ChordDiagramCard
            key={name}
            name={name}
            active={name === current}
            size="sm"
            onClick={() => onSelectChord(name)}
          />
        ))}
      </div>
    </div>
  );
}
