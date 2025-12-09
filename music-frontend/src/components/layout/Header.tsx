import { useEffect, useState } from 'react';
import { ToggleSlider } from './ToggleSlider';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      return (stored as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore (SSR or unavailable localStorage)
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b app-accent transition-all duration-300 ${
      isScrolled 
        ? 'bg-app/95 backdrop-blur-xl shadow-lg' 
        : 'bg-app/80 backdrop-blur-md'
    }`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-muted text-app-accent">
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
            <div className="text-sm font-semibold tracking-wide text-app">
              SonicLab
            </div>
            <div className="text-xs app-text-muted">
              Advanced Music Analysis
            </div>
          </div>
        </div>

        {/* toggle function */}
        {/* <div className="flex items-center gap-3">
          <ToggleSlider
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            isToggled={theme === 'dark'}
            onToggle={() => setTheme((s) => (s === 'dark' ? 'light' : 'dark'))}
          />
        </div> */}
      </div>
    </header>
  );
}
