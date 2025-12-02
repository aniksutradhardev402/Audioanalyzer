


interface TimelineProps {
  duration: number;
  currentTime: number;
 
  onSeek?: (time: number) => void;
}

export const TimelineWithChords: React.FC<TimelineProps> = ({
  duration,
  currentTime,
 
  onSeek,
}) => {
  const measures = 16; // purely visual

  

  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!onSeek || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div className="relative border-b border-slate-900 bg-[#05080f] px-5 py-2 text-[10px] text-slate-400">
      {/* clickable measure ruler */}
      <div
        className="relative flex items-center cursor-pointer"
        onClick={handleSeek}
      >
        <div className="flex flex-1 justify-between text-[10px] text-slate-500">
          {Array.from({ length: measures }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              <span className="h-4 w-px bg-slate-700/60" />
              <span className="mt-1">{i + 1}</span>
            </div>
          ))}
        </div>

        {/* small current chord badge on the right */}
        <div className="ml-4 flex items-center gap-2">
          
          
        </div>

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-[#00d6d6] shadow-[0_0_18px_rgba(0,214,214,0.7)]"
          style={{ left: `${playheadPct}%` }}
        />
      </div>
    </div>
  );
};
