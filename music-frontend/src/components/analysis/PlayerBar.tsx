export function PlayerBar() {
  return (
    <section className="mb-6 rounded-2xl border border-app bg-app-elevated/80 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-app-accent text-on-accent shadow-lg">
          <svg
            className="ml-[2px] h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 5v14l12-7z" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 text-[11px] app-text-muted">
            <span>00:00</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-app-elevated">
              <div className="h-full w-1/3 rounded-full bg-app-accent" />
            </div>
            <span>00:00</span>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[11px] app-text-muted sm:flex">
          <span className="uppercase tracking-wide app-text-muted">Master</span>
          <div className="flex h-1 w-16 overflow-hidden rounded-full bg-app-elevated">
            <div className="h-full w-3/4 bg-app-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
