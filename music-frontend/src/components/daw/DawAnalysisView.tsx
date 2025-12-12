import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnalysisResult as BaseAnalysisResult, StemName, NoteEvent } from '../../types/analysis';
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
import { PageShell } from '../layout/PageShell';
import { DownloadModal } from './DownloadModal';
import { LyricsPanel } from './LyricsPanel';

interface LyricLine {
  start: number;
  end: number;
  text: string;
  chord?: string;
}

// Extend the base result type to include new properties from the backend
type AnalysisResult = BaseAnalysisResult & {
  lyrics_data?: LyricLine[];
  lyrics_doc?: string | null;
  lyrics_task_id?: string;
};

interface DawAnalysisViewProps {
  result: AnalysisResult;
}

type VolumeMap = Record<StemName | 'master', number>;

export const DawAnalysisView: React.FC<DawAnalysisViewProps> = ({ result }) => {
  const [activeStem, setActiveStem] = useState<StemName | 'master'>('master');
    const [playbackRate, setPlaybackRate] = useState(1);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [lyricsData, setLyricsData] = useState<LyricLine[] | undefined>(result.lyrics_data);
  const [lyricsDoc, setLyricsDoc] = useState<string | null | undefined>(result.lyrics_doc);
  const [isLyricsLoading, setIsLyricsLoading] = useState(!result.lyrics_data && !!result.lyrics_task_id);
  const [isLyricsAutoScroll, setIsLyricsAutoScroll] = useState(true);


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
    result.stems.master || result.stems.vocals || result.stems.other || null;

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

  const activeChord = useMemo(
    () =>
      chordsCondensed.find(
        (c) => mainAnalysis.currentTime >= c.start_time && mainAnalysis.currentTime < c.end_time,
      )?.chord_name ?? '--',
    [chordsCondensed, mainAnalysis.currentTime],
  );

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

  // --- Poll for lyrics if a task ID is provided ---
  useEffect(() => {
    // Log lyricsData once when it's loaded or updated
    console.log('Full Lyrics Data:', lyricsData);
  }, [lyricsData]);

  useEffect(() => {
    // Don't poll if we already have lyrics or there's no task ID
    if (lyricsData || !result.lyrics_task_id) {
      return;
    }

    let isCancelled = false;

    const intervalId = setInterval(async () => {
      if (isCancelled) {
        return;
      }
      try {
        const statusRes = await fetch(getFileUrl(`status/${result.lyrics_task_id}`)!);
        const statusData = await statusRes.json();

        if (statusData.state === 'SUCCESS') {
          clearInterval(intervalId); // Stop polling
          const finalRes = await fetch(getFileUrl(`result/${result.lyrics_task_id}`)!);
          const finalData = await finalRes.json();
          if (!isCancelled) {
            setLyricsData(finalData.lyrics_data);
            setLyricsDoc(finalData.lyrics_doc);
            setIsLyricsLoading(false);
          }
        } else if (statusData.state === 'FAILURE') {
          console.error('Lyrics analysis task failed:', statusData.error);
          setIsLyricsLoading(false);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling for lyrics status:', error);
        setIsLyricsLoading(false);
        clearInterval(intervalId);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [lyricsData, result.lyrics_task_id]);

  return (
    <PageShell>
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
        onDownloadClick={() => setDownloadModalOpen(true)}
      />

      {/* Timeline + chords with click-to-seek */}
      <TimelineWithChords
        duration={duration}
        currentTime={mainAnalysis.currentTime}
        
        onSeek={seekTo}
      />

      {/* Master waveform across top */}
      <div className="border-b app-accent bg-app px-5 py-2">
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
      <div className="mt-5 flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Tracks column */}
       <div className="flex h-96 w-full flex-col border-2 border-app bg-app md:h-auto md:w-72">
  {/* Master volume header (fixed) */}
  <div className="border-b border-app bg-app-elevated px-4 py-2  app-muted">
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
      className="h-1 w-full cursor-pointer accent-app-accent-soft"
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

        {/* Right side: hidden main audio + lyrics + note detector */}
        <div className="flex flex-1 flex-col  bg-app">
          <audio
            ref={mainAudioRef}
            src={mainUrl || undefined}
            preload="auto"
            crossOrigin="anonymous"
            className="hidden"
          />

          {/* Scrollable Lyrics Panel container */}
          <div className="ml-10 flex-1 overflow-y-auto o-scrollbar">
            <LyricsPanel
              lyricsData={lyricsData || []}
              currentTime={mainAnalysis.currentTime}
              isLoading={isLyricsLoading}
              isAutoScrollEnabled={isLyricsAutoScroll}
              onToggleAutoScroll={() => setIsLyricsAutoScroll((prev) => !prev)}
            />
          </div>

        </div>
      </div>
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        stems={result.stems}
        songId={result.song_id}
        lyricsDocPath={lyricsDoc}
      />
      {/* Floating "Now" Chord Display */}
      <div className="fixed bottom-6 left-6 z-50 flex-col items-center gap-2 rounded-2xl border border-app bg-app-elevated p-3 shadow-2xl">
        <span className=" text-[10px]  text-slate-300">Now</span>
        <div className="flex h-14 w-24 items-center justify-center rounded-2xl bg-app text-2xl font-bold text-cyan-600 shadow-[0_0_35px_rgba(0,214,214,0.8)]">
          {activeChord}
        </div>
      </div>
      {/* Floating Note Display */}
      {/* Adjusted position to avoid overlap */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-app bg-app-elevated p-3 shadow-2xl">
        <span className="text-xs uppercase tracking-wide text-app-muted">
          Note
        </span>
        <div className="flex h-12 min-w-[80px] items-center justify-center rounded-full bg-app px-4 text-xl font-bold text-amber-500 shadow-[0_0_20px_rgba(255,167,0,0.6)]">
          {activeNoteName ?? '—'}
        </div>
        <span className="text-xs uppercase tracking-wide text-app-muted">
          ({noteLabel})
        </span>
      </div>
   </PageShell>
  );
};


//design
/*
┌─ Transport Bar (BPM, play/pause, seek) ──────┐
├─ Timeline + Chord Progression ───────────────┤
├─ Master Waveform Strip ──────────────────────┤
├─ Big Chord Panel ────────────────────────────┤
│ Tracks Sidebar (fixed 288px) │ Main Player    │
│ ┌─ Master Vol Slider ──────┐ │ hidden <audio> │
│ │ Guitar [wave][vol][mute] │ │ Note: C4 Vocals│
│ │ Bass   [wave][vol][mute] │ │                │
│ │ Vocals [wave][vol][mute] │ └────────────────┘
│ └─ Drums ─────────────────┘
*/