interface NotesDetectorProps {
  sourceLabel: string;     // e.g. "Master", "Bass", "Guitar"
  noteName: string | null; // e.g. "C3"
  visible: boolean;
}

export function NotesDetector({ sourceLabel, noteName, visible }: NotesDetectorProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 text-[11px] text-amber-600">
      <span className="uppercase tracking-wide opacity-80">Note</span>
      <div className="flex h-7 min-w-[40px] items-center justify-center rounded-full bg-[#050812] px-3 text-xs font-semibold text-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.55)]">
        {noteName ?? '—'}
      </div>
      <span className="text-[10px] uppercase tracking-wide text-[#9ea8c0]">
        {sourceLabel}
      </span>
    </div>
  );
}
