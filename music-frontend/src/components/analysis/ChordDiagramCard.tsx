import React from 'react';

interface ChordDiagramCardProps {
  name: string;
  active?: boolean;
  size?: 'lg' | 'sm';
  onClick?: () => void;
}

export const ChordDiagramCard: React.FC<ChordDiagramCardProps> = ({
  name,
  active = false,
  size = 'sm',
  onClick,
}) => {
  const isLg = size === 'lg';
  const boxClasses = isLg
    ? 'h-24 w-16'
    : 'h-16 w-11';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center rounded-2xl border px-2 py-2 text-xs transition-colors ${
        active
          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.4)]'
          : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-cyan-500/60'
      }`}
    >
      <div
        className={`mb-1 flex flex-col justify-between rounded-md border border-slate-700 bg-slate-950/80 p-[3px] ${boxClasses}`}
      >
        {Array.from({ length: 4 }).map((_, stringIdx) => (
          <div
            key={stringIdx}
            className="flex flex-1 items-center justify-between"
          >
            {Array.from({ length: 4 }).map((__, fretIdx) => {
              // Fake dots just to give some variation; you can later map real voicings.
              const isDot =
                (fretIdx === 1 && (stringIdx === 1 || stringIdx === 2)) ||
                (isLg && fretIdx === 2 && stringIdx === 0);

              return (
                <div
                  key={fretIdx}
                  className="flex-1 border-l border-slate-800/80 last:border-r"
                >
                  {isDot && (
                    <div className="mx-auto my-[2px] h-[6px] w-[6px] rounded-full bg-cyan-400" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="text-[11px] font-semibold">{name}</div>
    </button>
  );
};
