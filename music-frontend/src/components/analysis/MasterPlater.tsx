import { useMemo, useRef } from 'react';
import { ChordEvent } from '../../types/analysis';
import { getFileUrl } from '../../lib/api';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { useStaticWaveform } from '../../hooks/useStaticWaveform';
import { Waveform } from './Waveform';
import { ChordNow } from './ChordNow';
import { condenseChords, getDistinctChordNames } from '../../utils/chords';

interface Props {
  audioPath?: string;
  chords: ChordEvent[];
}

export function MasterPlayer({ audioPath, chords }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = useMemo(() => getFileUrl(audioPath || null), [audioPath]);

  const analysis = useAudioAnalyzer(audioRef);
  const staticWaveform = useStaticWaveform(url, 600);

  const condensed = useMemo(
    () => condenseChords(chords),
    [chords],
  );
  const distinctChordNames = useMemo(
    () => getDistinctChordNames(condensed),
    [condensed],
  );

  const duration =
    analysis.duration ||
    (condensed.length
      ? condensed[condensed.length - 1].end_time
      : 0);

  const activeChordIndex = useMemo(() => {
    if (!condensed.length || !duration) return -1;
    const t = analysis.currentTime;
    return condensed.findIndex(
      (c) => t >= c.start_time && t < c.end_time,
    );
  }, [condensed, analysis.currentTime, duration]);

  const activeChordName =
    activeChordIndex >= 0 ? condensed[activeChordIndex].chord_name : null;

  const seekTo = (time: number) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const clamped = Math.max(0, Math.min(time, duration));
    el.currentTime = clamped;
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch((e) => console.error('play failed', e));
    } else {
      el.pause();
    }
  };

  const formatted = (t: number) => {
    if (!Number.isFinite(t)) return '00:00.0';
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const tenths = Math.floor((t * 10) % 10);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${tenths}`;
  };

  return (
    <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/80">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>Master</span>
        <span>
          {formatted(analysis.currentTime)} / {formatted(duration)}
        </span>
      </div>

      {/* SCROLLABLE WAVEFORM */}
      <Waveform
        samples={staticWaveform}
        duration={duration}
        currentTime={analysis.currentTime}
        onSeek={seekTo}
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30"
        >
          {analysis.isPlaying ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg
              className="ml-[1px] h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>

        <div className="text-[11px] text-slate-400">
          <div>{analysis.isPlaying ? 'Playing' : 'Paused'}</div>
          <div>Click waveform or chord to jump</div>
        </div>
      </div>

      {/* hidden audio element */}
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* CHORDIFY-LIKE ACTIVE CHORD IN CENTER */}
      <ChordNow
        activeChord={activeChordName}
        distinctChords={distinctChordNames}
        onSelectChord={(name) => {
          const first = condensed.find((c) => c.chord_name === name);
          if (first) seekTo(first.start_time);
        }}
      />
    </section>
  );
}
