// src/components/analysis/ChordNow.tsx
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
      <div className="mt-4 rounded-[22px] border border-[#263040] bg-[#111726] px-4 py-3 text-xs text-[#a9b4c9]">
        Chord detection unavailable for this track.
      </div>
    );
  }

  const current =
    activeChord && distinctChords.includes(activeChord)
      ? activeChord
      : distinctChords[0];

  return (
    <div className="mt-4 rounded-[28px] border border-[#263040] bg-[#141b2b] p-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#a9b4c9]">
        Chords
      </div>

      {/* current chord name in the centre */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#050812] text-base font-bold text-[#00d6d6] shadow-[0_0_40px_rgba(0,214,214,0.55)]">
          {current}
        </div>
      </div>

      {/* distinct chord list as pills */}
      <div className="flex flex-wrap gap-8 px-2">
        {distinctChords.map((name) => {
          const active = name === current;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectChord(name)}
              className={`
                rounded-full border px-4 py-1 text-[11px] font-semibold transition-colors
                ${
                  active
                    ? 'border-[#00d6d6] bg-[#0d2028] text-[#e7f9ff] shadow-[0_0_0_1px_rgba(0,214,214,0.6)]'
                    : 'border-[#303b4d] bg-[#151f30] text-[#d0d8e8] hover:border-[#00d6d6] hover:text-[#e7f9ff]'
                }
              `}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
