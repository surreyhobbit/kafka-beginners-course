import type { LoggedSet, TrackingType } from '../types';

interface SetRowProps {
  set: LoggedSet;
  trackingType: TrackingType;
  displayNumber: number;
  onChange: (set: LoggedSet) => void;
  onDelete: () => void;
}

function parseNonNegativeFloat(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  if (Number.isNaN(value) || value < 0) return null;
  return value;
}

function parsePositiveInt(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Math.round(Number(raw));
  if (Number.isNaN(value) || value < 0) return null;
  return value;
}

export default function SetRow({ set, trackingType, displayNumber, onChange, onDelete }: SetRowProps) {
  const isDuration = trackingType === 'duration' || trackingType === 'duration_per_side';
  const sideLabel = set.side === 'left' ? 'L' : set.side === 'right' ? 'R' : null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-2 dark:bg-slate-800/60">
      <span className="w-9 shrink-0 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {sideLabel ? `${sideLabel}${displayNumber}` : `#${displayNumber}`}
      </span>

      {isDuration ? (
        <label className="flex flex-1 items-center gap-1">
          <span className="sr-only">Duration in seconds, set {displayNumber}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="sec"
            value={set.durationSeconds ?? ''}
            onChange={(e) => onChange({ ...set, durationSeconds: parsePositiveInt(e.target.value) })}
            className="tap-target w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-center text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">sec</span>
        </label>
      ) : (
        <>
          <label className="flex flex-1 items-center gap-1">
            <span className="sr-only">Weight in kilograms, set {displayNumber}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              placeholder="kg"
              value={set.weightKg ?? ''}
              onChange={(e) => onChange({ ...set, weightKg: parseNonNegativeFloat(e.target.value) })}
              className="tap-target w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-center text-sm dark:border-slate-600 dark:bg-slate-900"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">kg</span>
          </label>
          <label className="flex flex-1 items-center gap-1">
            <span className="sr-only">Reps, set {displayNumber}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="reps"
              value={set.reps ?? ''}
              onChange={(e) => onChange({ ...set, reps: parsePositiveInt(e.target.value) })}
              className="tap-target w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-center text-sm dark:border-slate-600 dark:bg-slate-900"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">reps</span>
          </label>
        </>
      )}

      <label className="tap-target flex shrink-0 items-center justify-center px-1">
        <span className="sr-only">Mark set {displayNumber} completed</span>
        <input
          type="checkbox"
          checked={set.completed}
          onChange={(e) => onChange({ ...set, completed: e.target.checked })}
          className="h-6 w-6 accent-emerald-600"
        />
      </label>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete set ${displayNumber}`}
        className="tap-target shrink-0 rounded-md px-2 text-lg leading-none text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
      >
        ×
      </button>
    </div>
  );
}
