import { NavLink, Route, Routes } from 'react-router-dom';
import TodayPage from './pages/TodayPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import ThemeToggle from './components/ThemeToggle';

const NAV_ITEMS = [
  { to: '/', label: 'Today', end: true },
  { to: '/history', label: 'History', end: false },
  { to: '/progress', label: 'Progress', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-300 bg-slate-100/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <h1 className="text-lg font-bold tracking-tight">Workout Tracker</h1>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-24 pt-4 sm:px-4">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-300 bg-slate-100/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-2xl">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `tap-target flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
