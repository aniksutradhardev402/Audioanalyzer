import { useEffect, useMemo, useRef, useState } from 'react';
import { ChordEvent } from '../../types/analysis';
import { getFileUrl } from '../../lib/api';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { useStaticWaveform } from '../../hooks/useStaticWaveform';
import { Waveform } from './Waveform';
import { ChordNow } from './ChordNow';
import { condenseChords, getDistinctChordNames } from '../../utils/chords';
import { detectNoteFromAnalysis } from '../../utils/notes';

interface Props {
  audioPath?: string | null;
  chords: ChordEvent[];
  isStemSource?: boolean;
  stemLabel?: string;
  onShowMaster?: () => void;
}

export function MasterPlayer({
  audioPath,
  chords,
  isStemSource = false,
  stemLabel,
  onShowMaster,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const url = useMemo(() => getFileUrl(audioPath || null), [audioPath]);
  const analysis = useAudioAnalyzer(audioRef);
  const staticWaveform = useStaticWaveform(url, 600);

  const condensed = useMemo(() => condenseChords(chords), [chords]);
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
      el.play().catch((e) => console.error('Play failed', e));
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

  // ---- UNIVERSAL NOTE DETECTOR ----

  const [note, setNote] = useState<string | null>(null);
  const lastSecRef = useRef<number>(-1);

  // which sources should show a note?
  const noteSourceKey = isStemSource
    ? (stemLabel ?? '').toLowerCase()
    : 'master';

  const shouldShowNote =
    noteSourceKey === 'master' ||
    noteSourceKey === 'vocals' ||
    noteSourceKey === 'bass' ||
    noteSourceKey === 'piano' ||
    noteSourceKey === 'other';

  useEffect(() => {
    if (!shouldShowNote || !analysis.isPlaying) return;
    const sec = Math.floor(analysis.currentTime);
    if (sec === lastSecRef.current) return;
    lastSecRef.current = sec;

    const detected = detectNoteFromAnalysis(analysis);
    if (detected) setNote(detected);
  }, [
    analysis.currentTime,
    analysis.frequency,
    analysis.isPlaying,
    analysis.sampleRate,
    shouldShowNote,
  ]);

  return (
    <section className="mb-8 rounded-[32px] border border-[#353f51] bg-[#3d4657] p-5 text-[#e4ebff] shadow-[0_28px_45px_rgba(0,0,0,0.75)]">
      {/* header row */}
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-[#c1cadf]">
        <div className="flex items-center gap-2">
          <span>{isStemSource ? 'Stem' : 'Master'}</span>
          {isStemSource && stemLabel && (
            <span className="rounded-full bg-[#00d6d6]/10 px-2 py-[2px] text-[10px] font-semibold text-[#00d6d6]">
              {stemLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isStemSource && onShowMaster && (
            <button
              type="button"
              onClick={onShowMaster}
              className="rounded-full border border-[#283344] bg-[#2b3446] px-2 py-[3px] text-[10px] text-[#dde5ff] hover:border-[#00d6d6] hover:text-[#00e1e1]"
            >
              Show Master
            </button>
          )}
          <span>
            {formatted(analysis.currentTime)} / {formatted(duration)}
          </span>
        </div>
      </div>

      {/* main waveform panel */}
      <Waveform
        samples={staticWaveform}
        duration={duration}
        currentTime={analysis.currentTime}
        onSeek={seekTo}
      />

      {/* transport + note badge row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00d6d6] text-[#041018] shadow-[0_0_30px_rgba(0,214,214,0.6)]"
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

          <div className="text-[11px] text-[#c1cadf]">
            <div>{analysis.isPlaying ? 'Playing' : 'Paused'}</div>
            <div>Click waveform or chord name to jump</div>
          </div>
        </div>

        {/* universal note detector (bottom-right) */}
        {shouldShowNote && (
          <div className="flex items-center gap-2 text-[11px] text-[#c1cadf]">
            <span className="uppercase tracking-wide">Note</span>
            <div className="flex h-7 min-w-[40px] items-center justify-center rounded-full bg-[#050812] px-3 text-xs font-semibold text-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.55)]">
              {note ?? '—'}
            </div>
          </div>
        )}
      </div>

      {/* hidden audio element */}
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* chord strip */}
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
