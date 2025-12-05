


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
    <div className="relative border-b border-app bg-app-elevated px-5 py-2 font-bold text-md text-app-accent">
      {/* clickable measure ruler */}
      <div
        className="relative flex items-center cursor-pointer"
        onClick={handleSeek}
      >
        <div className="flex flex-1 justify-between text-md text-app-accent-soft">
          {Array.from({ length: measures }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              <span className="h-4 w-[4px] bg-app-accent" />
              <span className="mt-1">{i + 1}</span>
            </div>
          ))}
        </div>

        
        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-app-accent shadow-[0_0_18px_rgba(0,214,214,0.7)]"
          style={{ left: `${playheadPct}%` }}
        />
      </div>
    </div>
  );
};
