// g:\audio_project\Audioanalyzer\music-frontend\src\components\layout\ToggleSlider.tsx
import React from 'react';

interface ToggleSliderProps {
  isToggled: boolean;
  onToggle: () => void;
  'aria-label': string;
  title: string;
}

export const ToggleSlider: React.FC<ToggleSliderProps> = ({ isToggled, onToggle, ...props }) => {
  return (
    <label htmlFor="theme-toggle" className="relative inline-flex cursor-pointer items-center" title={props.title}>
      <input
        type="checkbox"
        id="theme-toggle"
        className="peer sr-only"
        checked={isToggled}
        onChange={onToggle}
        aria-label={props['aria-label']}
      />
      <div className="peer h-6 w-11 rounded-full bg-app-muted after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] 
      peer-checked:bg-app-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2"></div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 sr-only">
        {props['aria-label']}
      </span>
    </label>
  );
};
