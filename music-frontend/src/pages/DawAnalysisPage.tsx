// // DawAnalysisPage.tsx
// // DAW-style analysis UI with left track list, top transport bar, timeline with chords, and track lanes.

// import React, { useMemo, useRef, useState } from 'react';
// import { AnalysisResult, StemName, ChordEvent } from '../types/analysis';
// import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
// import { getFileUrl } from '../lib/api';
// import { condenseChords } from '../utils/chords';
// import { midiToNoteName, getNoteAtTime } from '../utils/notes';

// // --- Transport Bar -------------------------------------------------------

// interface TransportBarProps {
//   bpm?: number;
//   keyName?: string;
//   currentTime: number;
//   duration: number;
//   isPlaying: boolean;
//   onTogglePlay: () => void;
// }

// const TransportBar: React.FC<TransportBarProps> = ({
//   bpm,
//   keyName,
//   currentTime,
//   duration,
//   isPlaying,
//   onTogglePlay,
// }) => {
//   const format = (t: number) => {
//     if (!Number.isFinite(t)) return '00:00.0';
//     const mins = Math.floor(t / 60);
//     const secs = Math.floor(t % 60);
//     const tenths = Math.floor((t * 10) % 10);
//     return `${mins.toString().padStart(2, '0')}:${secs
//       .toString()
//       .padStart(2, '0')}.${tenths}`;
//   };

//   return (
//     <header className="flex items-center gap-6 border-b border-slate-800 bg-[#05080f] px-6 py-3 text-xs text-slate-200">
//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={onTogglePlay}
//           className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00d6d6] text-slate-900 shadow-[0_0_18px_rgba(0,214,214,0.6)]"
//         >
//           {isPlaying ? (
//             <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
//             </svg>
//           ) : (
//             <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M7 5v14l12-7z" />
//             </svg>
//           )}
//         </button>
//         <div className="flex flex-col text-[11px]">
//           <span className="font-semibold tracking-wide">SonicLab Session</span>
//           <span className="text-slate-400">DAW view</span>
//         </div>
//       </div>

//       <div className="flex items-center gap-4 text-[11px]">
//         <div className="rounded-full bg-[#121826] px-3 py-1">
//           <span className="mr-1 text-slate-400">BPM</span>
//           <span className="font-semibold">{bpm ?? '--'}</span>
//         </div>
//         <div className="rounded-full bg-[#121826] px-3 py-1">
//           <span className="mr-1 text-slate-400">Key</span>
//           <span className="font-semibold">{keyName ?? '--'}</span>
//         </div>
//       </div>

//       <div className="ml-auto rounded-full bg-[#121826] px-4 py-1 text-[11px]">
//         {format(currentTime)} / {format(duration)}
//       </div>
//     </header>
//   );
// };

// // --- Timeline + Chords Ruler --------------------------------------------

// interface TimelineProps {
//   duration: number;
//   currentTime: number;
//   chords: ChordEvent[];
// }

// const TimelineWithChords: React.FC<TimelineProps> = ({
//   duration,
//   currentTime,
//   chords,
// }) => {
//   const measures = 16;
//   const secondsPerMeasure = duration > 0 ? duration / measures : 1;

//   const activeChord = useMemo(() => {
//     return chords.find(c => currentTime >= c.start_time && currentTime < c.end_time) || null;
//   }, [chords, currentTime]);

//   const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;

//   return (
//     <div className="relative border-b border-slate-800 bg-[#05080f] px-6 py-2 text-[10px] text-slate-400">
//       <div className="flex items-center gap-3">
//         {/* measure ticks */}
//         <div className="relative flex-1">
//           <div className="flex justify-between text-[10px] text-slate-500">
//             {Array.from({ length: measures }).map((_, i) => (
//               <div key={i} className="flex flex-1 flex-col items-center">
//                 <span className="h-4 w-px bg-slate-700/60" />
//                 <span className="mt-1">{i + 1}</span>
//               </div>
//             ))}
//           </div>
//           {/* playhead */}
//           <div
//             className="pointer-events-none absolute inset-y-0 w-[2px] bg-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.7)]"
//             style={{ left: `${playheadPct}%` }}
//           />
//         </div>

//         {/* current chord badge */}
//         <div className="ml-4 flex items-center gap-2">
//           <span className="uppercase tracking-wide text-[9px] text-slate-500">Chord</span>
//           <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a0f18] text-xs font-semibold text-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.6)]">
//             {activeChord ? activeChord.chord_name : '--'}
//           </div>
//         </div>
//       </div>

//       {/* chords strip beneath timeline */}
//       <div className="mt-2 flex gap-1 text-[9px] text-slate-300">
//         {chords.map((c, idx) => {
//           const widthPct = duration > 0 ? ((c.end_time - c.start_time) / duration) * 100 : 0;
//           const isActive = activeChord && activeChord === c;
//           return (
//             <div
//               key={`${c.chord_name}-${idx}`}
//               className={`flex items-center justify-center rounded-sm border px-1 ${
//                 isActive
//                   ? 'border-[#00d6d6] bg-[#0a141d]' 
//                   : 'border-[#283043] bg-[#101826]'
//               }`}
//               style={{ width: `${Math.max(widthPct, 3)}%` }}
//             >
//               {c.chord_name}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // --- Track Lane ---------------------------------------------------------

// interface TrackLaneProps {
//   name: string;
//   stemName: StemName | 'master';
//   path?: string | null;
//   isActive: boolean;
//   onClick: () => void;
// }

// const TrackLane: React.FC<TrackLaneProps> = ({
//   name,
//   stemName,
//   path,
//   isActive,
//   onClick,
// }) => {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const analysis = useAudioAnalyzer(audioRef);
//   const url = path ? getFileUrl(path) : null;

//   return (
//     <div
//       className={`flex h-14 items-center border-b border-slate-800 bg-[#090f18] px-4 text-xs text-slate-100 ${
//         isActive ? 'bg-[#101824]' : ''
//       }`}
//       onClick={onClick}
//     >
//       <div className="flex w-40 items-center gap-3">
//         <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c2433] text-[10px] text-slate-200">
//           {stemName === 'master' ? 'M' : stemName[0].toUpperCase()}
//         </div>
//         <div className="flex flex-col">
//           <span className="text-[11px] font-semibold">{name}</span>
//           <span className="text-[10px] text-slate-500">Fx</span>
//         </div>
//       </div>

//       {/* simple mini level meter */}
//       <div className="flex flex-1 items-center">
//         <div className="h-1 w-full rounded-full bg-[#141a24]">
//           <div
//             className="h-full rounded-full bg-[#00d6d6]"
//             style={{
//               width: `${analysis.isPlaying ? 60 : 30}%`,
//               transition: 'width 150ms ease',
//             }}
//           />
//         </div>
//       </div>

//       {/* audio element (hidden UI) */}
//       <audio
//         ref={audioRef}
//         src={url || undefined}
//         preload="auto"
//         crossOrigin="anonymous"
//         className="hidden"
//       />
//     </div>
//   );
// };

// // --- DAW Analysis Page --------------------------------------------------

// interface DawAnalysisPageProps {
//   result: AnalysisResult;
// }

// export const DawAnalysisPage: React.FC<DawAnalysisPageProps> = ({ result }) => {
//   const [activeStem, setActiveStem] = useState<StemName | 'master'>('master');

//   const condensedChords = useMemo(
//     () => condenseChords(result.chords),
//     [result.chords],
//   );

//   const mainPath =
//     activeStem === 'master'
//       ? result.stems.vocals || result.stems.other || null
//       : result.stems[activeStem];

//   const mainAudioRef = useRef<HTMLAudioElement | null>(null);
//   const mainAnalysis = useAudioAnalyzer(mainAudioRef);
//   const mainUrl = mainPath ? getFileUrl(mainPath) : null;

//   const duration =
//     mainAnalysis.duration ||
//     (condensedChords.length
//       ? condensedChords[condensedChords.length - 1].end_time
//       : 0);

//   const notesForStem = result.notes?.[activeStem] || result.notes?.master;
//   const activeNote = getNoteAtTime(mainAnalysis.currentTime, notesForStem);
//   const activeNoteName = activeNote ? midiToNoteName(activeNote.pitch) : null;

//   const togglePlay = () => {
//     const el = mainAudioRef.current;
//     if (!el) return;
//     if (el.paused) {
//       el.play().catch(() => {});
//     } else {
//       el.pause();
//     }
//   };

//   return (
//     <div className="flex h-screen flex-col bg-[#02040a] text-slate-100">
//       <TransportBar
//         bpm={result.metadata.bpm}
//         keyName={result.metadata.key}
//         currentTime={mainAnalysis.currentTime}
//         duration={duration}
//         isPlaying={!mainAnalysis.timeDomain ? false : !mainAudioRef.current?.paused}
//         onTogglePlay={togglePlay}
//       />

//       <TimelineWithChords
//         duration={duration}
//         currentTime={mainAnalysis.currentTime}
//         chords={condensedChords}
//       />

//       <div className="flex flex-1 overflow-hidden">
//         {/* Track list / lanes */}
//         <div className="w-64 border-r border-slate-800 bg-[#050811]">
//           <TrackLane
//             name="Master"
//             stemName="master"
//             path={result.stems.vocals || result.stems.other}
//             isActive={activeStem === 'master'}
//             onClick={() => setActiveStem('master')}
//           />
//           {(['guitar', 'bass', 'vocals', 'piano', 'other', 'drums'] as StemName[]).map(
//             stem => (
//               <TrackLane
//                 key={stem}
//                 name={stem[0].toUpperCase() + stem.slice(1)}
//                 stemName={stem}
//                 path={result.stems[stem]}
//                 isActive={activeStem === stem}
//                 onClick={() => setActiveStem(stem)}
//               />
//             ),
//           )}
//         </div>

//         {/* Main audio element + note badge */}
//         <div className="flex flex-1 flex-col bg-[#02040a]">
//           {/* hidden audio for main timeline */}
//           <audio
//             ref={mainAudioRef}
//             src={mainUrl || undefined}
//             preload="auto"
//             crossOrigin="anonymous"
//             className="hidden"
//           />

//           <div className="flex flex-1 flex-col justify-end px-6 pb-4 text-xs">
//             <div className="ml-auto flex items-center gap-2 text-[11px] text-[#c1cadf]">
//               <span className="uppercase tracking-wide text-[9px] text-slate-500">
//                 Note
//               </span>
//               <div className="flex h-7 min-w-[40px] items-center justify-center rounded-full bg-[#050812] px-3 text-xs font-semibold text-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.55)]">
//                 {activeNoteName ?? '—'}
//               </div>
//               <span className="text-[9px] uppercase tracking-wide text-[#9ea8c0]">
//                 {activeStem === 'master'
//                   ? 'Master'
//                   : activeStem.charAt(0).toUpperCase() + activeStem.slice(1)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//checl later this file