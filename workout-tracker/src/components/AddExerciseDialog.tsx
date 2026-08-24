import { useState } from 'react';
import type { TrackingType } from '../types';

interface AddExerciseDialogProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (name: string, trackingType: TrackingType, defaultSets: number) => void;
}

const TRACKING_OPTIONS: { value: TrackingType; label: string }[] = [
  { value: 'weight_reps', label: 'Weight + reps' },
  { value: 'duration', label: 'Timed (duration)' },
  { value: 'weight_reps_per_side', label: 'Weight + reps, per side' },
  { value: 'duration_per_side', label: 'Timed, per side' },
];

export default function AddExerciseDialog({ open, onCancel, onAdd }: AddExerciseDialogProps) {
  const [name, setName] = useState('');
  const [trackingType, setTrackingType] = useState<TrackingType>('weight_reps');
  const [sets, setSets] = useState(3);

  if (!open) return null;

  function reset() {
    setName('');
    setTrackingType('weight_reps');
    setSets(3);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, trackingType, Math.max(1, sets));
    reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" role="presentation" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-xl border border-slate-300 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Add extra exercise</h2>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Exercise name</span>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Face pull"
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tracking type</span>
          <select
            value={trackingType}
            onChange={(e) => setTrackingType(e.target.value as TrackingType)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            {TRACKING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Starting number of sets</span>
          <input
            type="number"
            min={1}
            max={10}
            value={sets}
            onChange={(e) => setSets(Number(e.target.value) || 1)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              reset();
              onCancel();
            }}
            className="tap-target rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button type="submit" className="tap-target rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
