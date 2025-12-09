import React, { useEffect} from 'react';

interface LyricLine {
  start: number;
  end: number;
  text: string;
}

interface LyricsPanelProps {
  lyricsData: LyricLine[];
  currentTime: number;
  isLoading?: boolean;
}

const isLineActive = (line: LyricLine, currentTime: number): boolean => {
  return currentTime >= line.start && currentTime < line.end;
};

export const LyricsPanel: React.FC<LyricsPanelProps> = ({ lyricsData, currentTime, isLoading }) => {
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
  
  // Log the activeLineIndex for debugging purposes
  useEffect(() => {
  console.log(`Current Time: ${currentTime.toFixed(2)}s, Active Line Index: ${activeLineIndex}`);
  }, [currentTime, activeLineIndex]);

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
    <div className="h-full overflow-y-auto o-scrollbar p-4 md:p-6 bg-app-elevated">
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
            <div key={index} className={`transition-all duration-300 ${isActive ? 'text-app scale-102' : 'text-app-muted'}`}>
              <p className="text-lg leading-relaxed">{line.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};