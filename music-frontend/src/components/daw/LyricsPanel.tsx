import React, { useEffect, useRef } from 'react';

interface LyricLine {
  start: number;
  end: number;
  text: string;
  chord?: string;
}

interface LyricsPanelProps {
  lyricsData: LyricLine[];
  currentTime: number;
  isLoading?: boolean;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
}

const isLineActive = (line: LyricLine, currentTime: number): boolean => {
  return currentTime >= line.start && currentTime < line.end;
};

export const LyricsPanel: React.FC<LyricsPanelProps> = ({ lyricsData, currentTime, isLoading, isAutoScrollEnabled, onToggleAutoScroll }) => {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // An alternative to findIndex using a standard for loop.
  // This can be slightly more performant on extremely large arrays, but is more verbose.
  let activeLineIndex = -1;
  for (let i = 0; i < lyricsData.length; i++) {
    const line = lyricsData[i];
    if (isLineActive(line, currentTime) && line.text.trim() !== '[Instrumental]') {
      activeLineIndex = i;
      break; // Exit the loop once the first active line is found
    }
  }
  
  // Effect to scroll the active line into view if auto-scroll is enabled
  useEffect(() => {
    if (isAutoScrollEnabled && activeLineIndex !== -1 && lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, isAutoScrollEnabled]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-app-elevated text-app-muted">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading lyrics...</span>
        </div>
      </div>
    );
  }

  if (!lyricsData || lyricsData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-app-elevated text-app-muted">
        <p>No lyrics available for this track.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto o-scrollbar p-4 md:p-6 bg-app-elevated">
       {lyricsData.length > 0 && (
        <button
          onClick={onToggleAutoScroll}
          title={isAutoScrollEnabled ? "Disable auto-scroll" : "Enable auto-scroll"}
          className={`sticky flex items-center gap-2 rounded-full px-3 py-2 text-xs shadow-lg backdrop-blur-sm border border-app-accent/50 transition-colors
            ${isAutoScrollEnabled ? 'bg-app-accent text-app font-semibold' : 'bg-app-elevated text-app-muted hover:bg-app-accent/20'}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span>Follow</span>
        </button>
      )}
      <div className="space-y-6">
        {lyricsData.map((line, index) => {
          const isActive = index === activeLineIndex;
          const isInstrumental = line.text.trim() === '[Instrumental]';

          // Render instrumental sections with a distinct, non-highlighted style
          if (isInstrumental) {
            return (
              <div key={index} className="text-center py-2">
                <p className="text-sm italic text-app-muted/50">{line.text}</p>
              </div>
            );
          }

          // Render regular lyric lines
          return (
            <div
              key={index}
              ref={(el) => { lineRefs.current[index] = el; }}
              className={`transition-all duration-300 ${isActive ? 'text-app scale-102' : 'text-app-muted'}`}
            >
              {line.chord && line.chord !== 'N' && (
                <p className="mb-1 font-bold text-cyan-400">
                  {line.chord}
                </p>
              )}
              <p className="text-lg leading-relaxed">{line.text}</p>
              
            </div>
          );
        })}
        
      </div>

     
    </div>
  );
};