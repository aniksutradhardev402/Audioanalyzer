import { useMemo, useRef } from 'react';
import { ChordEvent } from '../../types/analysis';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { getFileUrl } from '../../lib/api';

interface Props {
  /** Raw backend path like "results/.../vocals.wav" */
  audioPath?: string;
  chords: ChordEvent[];
}

function condenseChords(chords: ChordEvent[]): ChordEvent[] {
  if (!chords.length) return [];
  const result: ChordEvent[] = [];
  for (const c of chords) {
    const last = result[result.length - 1];
    if (last && last.chord_name === c.chord_name) {
      last.end_time = c.end_time;
    } else {
      result.push({ ...c });
    }
  }
  return result;
}

export function MasterPlayer({ audioPath, chords }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = getFileUrl(audioPath ?? null); // 👈 ALWAYS via getFileUrl
  const analysis = useAudioAnalyzer(audioRef, { fftSize: 2048 });

  const totalDuration =
    analysis.duration || (chords.length ? chords[chords.length - 1].end_time : 0);

  const condensedChords = useMemo(
    () => condenseChords(chords),
    [chords],
  );

  const activeChordIndex = useMemo(() => {
    if (!condensedChords.length || !totalDuration) return -1;
    const t = analysis.currentTime;
    return condensedChords.findIndex(
      (c) => t >= c.start_time && t < c.end_time,
    );
  }, [condensedChords, analysis.currentTime, totalDuration]);

  const waveformSamples = useMemo(() => {
    const td = analysis.timeDomain;
    if (!td) return null;

    const bars = 160;
    const step = Math.max(1, Math.floor(td.length / bars));

    return Array.from({ length: bars }).map((_, i) => {
      const idx = i * step;
      return Math.abs(td[idx]);
    });
  }, [analysis.timeDomain]);

  const progressPercent =
    totalDuration > 0 ? (analysis.currentTime / totalDuration) * 100 : 0;

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el || !url) return;

    if (el.paused) {
      el.play().catch((e) => console.error('Play failed', e));
    } else {
      el.pause();
    }
  };

  const currentChord =
    activeChordIndex >= 0 ? condensedChords[activeChordIndex].chord_name : '—';

  return (
    <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/80">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>Master</span>
        <span>
          {totalDuration
            ? `${analysis.currentTime.toFixed(1)} / ${totalDuration.toFixed(1)}s`
            : '00.0 / 00.0s'}
        </span>
      </div>

      {/* Waveform */}
      <div className="relative mb-4 h-24 overflow-hidden rounded-2xl bg-slate-950/80 px-2 py-6">
        <div className="flex h-full items-center gap-[1px]">
          {waveformSamples
            ? waveformSamples.map((v, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-cyan-500/80"
                  style={{
                    height: `${10 + v * 80}%`,
                    opacity: 0.4 + v * 0.6,
                  }}
                />
              ))
            : Array.from({ length: 120 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-slate-700/50"
                  style={{
                    height: `${30 + 40 * Math.abs(Math.sin(i * 0.25))}%`,
                  }}
                />
              ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-3 w-[2px] rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Transport + native controls (visible for now) */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30"
            disabled={!url}
          >
            {analysis.isPlaying ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            ) : (
              <svg
                className="ml-[2px] h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 5v14l12-7z" />
              </svg>
            )}
          </button>

          {url ? (
            <audio
              ref={audioRef}
              src={url}
              preload="auto"
              controls
              muted={false}
              crossOrigin='anonymous'

              className="w-full max-w-xs text-[11px] text-slate-200"
            />
          ) : (
            <p className="text-[11px] text-slate-500">
              No master audio available.
            </p>
          )}

          <div className="text-[11px] text-slate-400">
            <div>{analysis.isPlaying ? 'Playing' : 'Paused'}</div>
            <div>Current chord: {currentChord}</div>
          </div>
        </div>

        {/* Chords */}
        <div className="mt-2 flex-1 rounded-2xl bg-slate-950/70 p-2 text-[11px] text-slate-300 md:mt-0">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Chords
          </div>
          {condensedChords.length ? (
            <div className="relative flex h-8 overflow-hidden rounded-xl bg-slate-900">
              {condensedChords.map((c, idx) => {
                const width =
                  totalDuration > 0
                    ? ((c.end_time - c.start_time) / totalDuration) * 100
                    : 0;
                const active = idx === activeChordIndex;

                return (
                  <div
                    key={`${c.chord_name}-${idx}`}
                    className={`flex items-center justify-center border-r border-slate-800 text-[10px] ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-900 text-slate-200'
                    }`}
                    style={{ width: `${Math.max(width, 2)}%` }}
                  >
                    {c.chord_name}
                  </div>
                );
              })}
              <div
                className="pointer-events-none absolute inset-y-1 w-[2px] rounded-full bg-white/80 opacity-70"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900 px-3 py-2 text-[11px] text-slate-400">
              Chord detection unavailable for this track.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
