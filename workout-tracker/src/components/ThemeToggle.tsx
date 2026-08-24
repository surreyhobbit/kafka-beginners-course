import { useState } from 'react';
import { applyTheme, getStoredTheme, type Theme } from '../utils/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme());

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="tap-target rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
