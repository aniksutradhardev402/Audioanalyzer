// src/components/analysis/ChordCards.tsx
import { ChordEvent } from '../../types/analysis';

interface ChordCardsProps {
  chords: ChordEvent[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function ChordCards({
  chords,
  duration,
  currentTime,
  onSeek,
}: ChordCardsProps) {
  if (!chords.length || !duration) {
    return (
      <div className="mt-3 rounded-2xl bg-app-elevated/70 px-3 py-2 text-xs app-text-muted">
        Chord detection unavailable for this track.
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-app-elevated/70 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide app-text-muted">
        Chords (click to jump)
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {chords.map((c, idx) => {
          const active =
            currentTime >= c.start_time && currentTime < c.end_time;

          return (
            <button
              key={`${c.chord_name}-${idx}`}
              type="button"
              onClick={() => onSeek(c.start_time)}
              className={`flex min-w-[72px] flex-col items-center rounded-2xl border px-2 py-2 text-xs transition-colors ${
                active
                  ? 'border-app-accent bg-app-accent/10 text-app-accent'
                  : 'border-app bg-app-elevated text-app hover:border-app-accent'
              }`}
            >
              {/* simple fretboard grid like chordify, stylized for your dark UI */}
              <div className="mb-1 flex h-16 w-12 flex-col justify-between rounded-md border border-app bg-app-elevated/80 p-[3px]">
                {Array.from({ length: 4 }).map((_, stringIdx) => (
                  <div
                    key={stringIdx}
                    className="flex flex-1 items-center justify-between"
                  >
                    {Array.from({ length: 4 }).map((__, fretIdx) => {
                      const isDot =
                        fretIdx === 1 &&
                        (stringIdx === 1 || stringIdx === 2); // fake but looks like chord dots

                      return (
                        <div
                          key={fretIdx}
                          className="flex-1 border-l border-app/80 last:border-r"
                        >
                          {isDot && (
                            <div className="mx-auto my-[2px] h-[6px] w-[6px] rounded-full bg-cyan-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-semibold">{c.chord_name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
