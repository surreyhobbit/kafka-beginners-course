import { useState } from 'react';
import type { LoggedExercise, LoggedSet } from '../types';
import SetRow from './SetRow';

interface ExerciseCardProps {
  exercise: LoggedExercise;
  previousText: string | null;
  isActive: boolean;
  defaultOpen: boolean;
  onChange: (exercise: LoggedExercise) => void;
  onRemove?: () => void;
}

function renumber(sets: LoggedSet[]): LoggedSet[] {
  return sets.map((s, i) => ({ ...s, setNumber: i + 1 }));
}

function makeBlankSet(setNumber: number, side: LoggedSet['side']): LoggedSet {
  return { setNumber, weightKg: null, reps: null, durationSeconds: null, side, completed: false };
}

export default function ExerciseCard({ exercise, previousText, isActive, defaultOpen, onChange, onRemove }: ExerciseCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isPerSide = exercise.trackingType === 'weight_reps_per_side' || exercise.trackingType === 'duration_per_side';

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;

  function updateSets(next: LoggedSet[]) {
    onChange({ ...exercise, sets: next });
  }

  function updateSetAt(index: number, updated: LoggedSet) {
    const next = exercise.sets.slice();
    next[index] = updated;
    updateSets(next);
  }

  function deleteSetAt(index: number) {
    const removedSide = exercise.sets[index].side;
    const rest = exercise.sets.filter((_, i) => i !== index);
    if (removedSide === null) {
      updateSets(renumber(rest));
      return;
    }
    let counter = 0;
    const next = rest.map((s) => (s.side === removedSide ? { ...s, setNumber: ++counter } : s));
    updateSets(next);
  }

  function addSet(side: LoggedSet['side']) {
    if (side === null) {
      updateSets([...exercise.sets, makeBlankSet(exercise.sets.length + 1, null)]);
      return;
    }
    const sideCount = exercise.sets.filter((s) => s.side === side).length;
    const newSet = makeBlankSet(sideCount + 1, side);
    if (side === 'left') {
      const leftSets = exercise.sets.filter((s) => s.side === 'left');
      const rightSets = exercise.sets.filter((s) => s.side === 'right');
      updateSets([...leftSets, newSet, ...rightSets]);
    } else {
      updateSets([...exercise.sets.filter((s) => s.side === 'left'), ...exercise.sets.filter((s) => s.side === 'right'), newSet]);
    }
  }

  function renderSetGroup(sets: LoggedSet[], side: LoggedSet['side'], label: string | null) {
    return (
      <div className="space-y-1.5">
        {label && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>}
        {sets.map((set, i) => {
          const globalIndex = exercise.sets.indexOf(set);
          return (
            <SetRow
              key={globalIndex}
              set={set}
              trackingType={exercise.trackingType}
              displayNumber={i + 1}
              onChange={(updated) => updateSetAt(globalIndex, updated)}
              onDelete={() => deleteSetAt(globalIndex)}
            />
          );
        })}
        <button
          type="button"
          onClick={() => addSet(side)}
          className="tap-target w-full rounded-md border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          + Add set
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm dark:bg-slate-900 ${
        isActive
          ? 'border-emerald-500 ring-1 ring-emerald-500/40'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap-target flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          {exercise.completed && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
          )}
          <span className="font-semibold">{exercise.name}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {totalSets > 0 && (
            <span>
              {completedSets}/{totalSets} sets
            </span>
          )}
          <span aria-hidden="true">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">{exercise.cue}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Target: {exercise.targetText}</p>
          {previousText && <p className="text-xs font-medium text-sky-600 dark:text-sky-400">{previousText}</p>}

          {isPerSide ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {renderSetGroup(exercise.sets.filter((s) => s.side === 'left'), 'left', 'Left')}
              {renderSetGroup(exercise.sets.filter((s) => s.side === 'right'), 'right', 'Right')}
            </div>
          ) : (
            renderSetGroup(exercise.sets, null, null)
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Notes</span>
            <textarea
              value={exercise.notes}
              onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes for this exercise"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <div className="flex items-center justify-between pt-1">
            <label className="tap-target flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={exercise.completed}
                onChange={(e) => onChange({ ...exercise, completed: e.target.checked })}
                className="h-5 w-5 accent-emerald-600"
              />
              Mark exercise completed
            </label>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="tap-target rounded-md px-2 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
