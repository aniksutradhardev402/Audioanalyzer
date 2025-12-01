export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            {/* Simple music note icon */}
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M9 18V5l10-2v13" />
              <circle cx="7" cy="18" r="2.5" />
              <circle cx="17" cy="16" r="2.5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-50">
              SonicLab
            </div>
            <div className="text-xs text-slate-400">
              Advanced Music Analysis
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
