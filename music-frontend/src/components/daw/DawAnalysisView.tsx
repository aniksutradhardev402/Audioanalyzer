import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnalysisResult, StemName, NoteEvent } from '../../types/analysis';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { getFileUrl } from '../../lib/api';
import { condenseChords } from '../../utils/chords';
import { getNoteAtTime, midiToNoteName } from '../../utils/notes';
import { useStaticWaveform } from '../../hooks/useStaticWaveform';
import { TransportBar } from './Transporter';
import { TimelineWithChords } from './TimelineWithChords';
import { TrackLane } from './TrackLane';
import { WaveStrip } from './Wavestrip';
import { BigChordPanel } from './BigChordsPanel';

interface DawAnalysisViewProps {
  result: AnalysisResult;
}

type VolumeMap = Record<StemName | 'master', number>;

export const DawAnalysisView: React.FC<DawAnalysisViewProps> = ({ result }) => {
  const [activeStem, setActiveStem] = useState<StemName | 'master'>('master');
    const [playbackRate, setPlaybackRate] = useState(1);


  // per-track volume + master volume
  const [trackVolumes, setTrackVolumes] = useState<VolumeMap>({
    master: 1,
    guitar: 1,
    bass: 1,
    vocals: 1,
    piano: 1,
    other: 1,
    drums: 1,
  });
  const [masterVolume, setMasterVolume] = useState(1);

  const chordsCondensed = useMemo(
    () => condenseChords(result.chords),
    [result.chords],
  );

  const masterPath =
    result.stems.vocals || result.stems.other || null;

  // URL helpers
  const pathForStem = (stem: StemName | 'master'): string | null =>
    stem === 'master' ? masterPath : result.stems[stem] || null;

  const urlForStem = (stem: StemName | 'master'): string | null => {
    const p = pathForStem(stem);
    return p ? getFileUrl(p) : null;
  };

  // static waveforms for master + all stems
  const masterWave = useStaticWaveform(urlForStem('master'), 800);
  const vocalsWave = useStaticWaveform(urlForStem('vocals'), 400);
  const guitarWave = useStaticWaveform(urlForStem('guitar'), 400);
  const bassWave = useStaticWaveform(urlForStem('bass'), 400);
  const pianoWave = useStaticWaveform(urlForStem('piano'), 400);
  const otherWave = useStaticWaveform(urlForStem('other'), 400);
  const drumsWave = useStaticWaveform(urlForStem('drums'), 400);

  const waveformMap: Record<StemName | 'master', number[] | null> = {
    master: masterWave,
    vocals: vocalsWave,
    guitar: guitarWave,
    bass: bassWave,
    piano: pianoWave,
    other: otherWave,
    drums: drumsWave,
  };

  // --- main audio source (master or selected stem) ---
  const mainPath = pathForStem(activeStem);
  const mainUrl = mainPath ? getFileUrl(mainPath) : null;

  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const mainAnalysis = useAudioAnalyzer(mainAudioRef);
 const mainStripSamples = waveformMap[activeStem];
  const duration =
    mainAnalysis.duration ||
    (chordsCondensed.length
      ? chordsCondensed[chordsCondensed.length - 1].end_time
      : 0);

  const seekTo = (time: number) => {
    const el = mainAudioRef.current;
    if (!el || !duration) return;
    const t = Math.max(0, Math.min(time, duration));
    el.currentTime = t;
  };

  const togglePlay = () => {
    const el = mainAudioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  // apply volume when active stem / master volume changes
  useEffect(() => {
    const el = mainAudioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    el.volume = masterVolume * (trackVolumes[activeStem] ?? 1);
  }, [masterVolume, trackVolumes, activeStem]);

  // --- universal note detector using backend notes ---
  const notesForSource: NoteEvent[] | undefined =
    (result.notes && result.notes[activeStem]) ||
    (result.notes && result.notes.master) ||
    undefined;

  const activeNote = getNoteAtTime(mainAnalysis.currentTime, notesForSource);
  const activeNoteName = activeNote ? midiToNoteName(activeNote.pitch) : null;

  const noteLabel =
    activeStem === 'master'
      ? 'Master'
      : activeStem.charAt(0).toUpperCase() + activeStem.slice(1);

  const handleTrackVolumeChange = (
    stem: StemName | 'master',
    value: number,
  ) => {
    setTrackVolumes((prev) => ({
      ...prev,
      [stem]: value,
    }));
  };

  const isPlaying =
    !!mainAudioRef.current && !mainAudioRef.current.paused;

  return (
    <div className="flex h-screen flex-col bg-[#02040a] text-slate-100">
      {/* Top transport bar */}
      <TransportBar
        bpm={result.metadata?.bpm}
        keyName={result.metadata?.estimated_key}
        currentTime={mainAnalysis.currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        playbackRate={playbackRate}                // 👈 NEW
        onChangePlaybackRate={setPlaybackRate}
      />

      {/* Timeline + chords with click-to-seek */}
      <TimelineWithChords
        duration={duration}
        currentTime={mainAnalysis.currentTime}
        
        onSeek={seekTo}
      />

      {/* Master waveform across top */}
      <div className="border-b border-slate-900 bg-[#05080f] px-5 py-2">
        <WaveStrip
          samples={mainStripSamples}
          duration={duration}
          currentTime={mainAnalysis.currentTime}
          onSeek={seekTo}
          height={50}
          active={activeStem === 'master'}
        />
      </div>

     <BigChordPanel
  chords={chordsCondensed}
  currentTime={mainAnalysis.currentTime}
  onSeek={seekTo}
/>

      {/* Main content: track list + note detector */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tracks column */}
       <div className="w-72 border-r border-slate-900 bg-[#050811] flex flex-col">
  {/* Master volume header (fixed) */}
  <div className="border-b border-slate-900 bg-[#05080f] px-4 py-2 text-[10px] text-slate-300">
    <div className="mb-1 flex items-center justify-between">
      <span className="uppercase tracking-wide">Master Volume</span>
      <span className="text-[9px] opacity-70">
        {Math.round(masterVolume * 100)}%
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={masterVolume}
      onChange={(e) => setMasterVolume(Number(e.target.value))}
      className="h-1 w-full cursor-pointer accent-[#00d6d6]"
    />
  </div>

  {/* Scrollable stem list */}
  <div className="flex-1 overflow-y-auto no-scrollbar">
    <TrackLane
      name="Master"
      stemName="master"
      isActive={activeStem === 'master'}
      duration={duration}
      currentTime={mainAnalysis.currentTime}
      waveformSamples={waveformMap.master}
      volume={trackVolumes.master}
      onVolumeChange={(v) => handleTrackVolumeChange('master', v)}
      onClick={() => setActiveStem('master')}
      onSeek={seekTo}
    />

    {(['guitar', 'bass', 'vocals', 'piano', 'other', 'drums'] as StemName[]).map(
      (stem) => (
        <TrackLane
          key={stem}
          name={stem.charAt(0).toUpperCase() + stem.slice(1)}
          stemName={stem}
          isActive={activeStem === stem}
          duration={duration}
          currentTime={mainAnalysis.currentTime}
          waveformSamples={waveformMap[stem]}
          volume={trackVolumes[stem]}
          onVolumeChange={(v) => handleTrackVolumeChange(stem, v)}
          onClick={() => setActiveStem(stem)}
          onSeek={seekTo}
        />
      ),
    )}
  </div>
</div>

        {/* Right side: hidden main audio + note detector */}
        <div className="flex flex-1 flex-col bg-[#02040a]">
          <audio
            ref={mainAudioRef}
            src={mainUrl || undefined}
            preload="auto"
            crossOrigin="anonymous"
            className="hidden"
          />

          {/* Bottom-right note display for active source */}
          <div className="flex flex-1 flex-col justify-end px-6 pb-4 text-xs">
            <div className="ml-auto flex items-center gap-2 text-[11px] text-[#c1cadf]">
              <span className="uppercase tracking-wide text-[9px] text-slate-500">
                Note
              </span>
              <div className="flex h-7 min-w-[40px] items-center justify-center rounded-full bg-[#050812] px-3 text-xs font-semibold text-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.55)]">
                {activeNoteName ?? '—'}
              </div>
              <span className="text-[9px] uppercase tracking-wide text-[#9ea8c0]">
                {noteLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
