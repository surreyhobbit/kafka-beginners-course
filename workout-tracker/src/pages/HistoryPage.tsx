import { useEffect, useMemo, useState } from 'react';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import type { WorkoutSession } from '../types';
import { deleteSession, getCompletedSessions } from '../db/db';
import { formatDisplayDate } from '../utils/date';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

function setValueText(exercise: WorkoutSession['exercises'][number]): string {
  const isDuration = exercise.trackingType === 'duration' || exercise.trackingType === 'duration_per_side';

  const fmt = (s: (typeof exercise.sets)[number]) => {
    const sideTag = s.side ? `${s.side === 'left' ? 'L' : 'R'} ` : '';
    if (isDuration) return `${sideTag}${s.durationSeconds ?? '-'}s`;
    return `${sideTag}${s.weightKg ?? '-'}kg×${s.reps ?? '-'}`;
  };

  if (!exercise.sets.length) return 'No sets logged';
  return exercise.sets.map(fmt).join(', ');
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [gymFilter, setGymFilter] = useState('all');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pendingDelete, setPendingDelete] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setSessions(await getCompletedSessions());
    setLoading(false);
  }

  const exerciseOptions = useMemo(() => {
    const names = new Map<string, string>();
    WORKOUT_TEMPLATES.forEach((w) => w.exercises.forEach((e) => names.set(e.id, e.name)));
    sessions.forEach((s) => s.exercises.forEach((e) => names.set(e.exerciseTemplateId, e.name)));
    return Array.from(names.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (gymFilter !== 'all' && s.workoutTemplateId !== gymFilter) return false;
      if (exerciseFilter !== 'all' && !s.exercises.some((e) => e.exerciseTemplateId === exerciseFilter)) return false;
      if (fromDate && s.date < fromDate) return false;
      if (toDate && s.date > toDate) return false;
      return true;
    });
  }, [sessions, gymFilter, exerciseFilter, fromDate, toDate]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteSession(pendingDelete.id);
    setPendingDelete(null);
    await refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">History</h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="col-span-1 block text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Gym</span>
          <select
            value={gymFilter}
            onChange={(e) => setGymFilter(e.target.value)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="all">All</option>
            {WORKOUT_TEMPLATES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-1 block text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Exercise</span>
          <select
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="all">All</option>
            {exerciseOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-1 block text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </label>

        <label className="col-span-1 block text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="tap-target mt-1 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState message="No workout history yet — complete Gym A or Gym B to start tracking progress." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((session) => (
            <li key={session.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <details>
                <summary className="tap-target flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold">{formatDisplayDate(session.date)}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {session.workoutName} · {session.exercises.filter((e) => e.completed).length} of {session.exercises.length} exercises completed
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-slate-400">
                    ▼
                  </span>
                </summary>

                <div className="space-y-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                  {session.exercises.map((exercise, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold">
                        {exercise.name} {exercise.completed && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{setValueText(exercise)}</p>
                      {exercise.notes && <p className="mt-0.5 text-xs italic text-slate-500 dark:text-slate-400">Notes: {exercise.notes}</p>}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPendingDelete(session)}
                    className="tap-target rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    Delete session
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this workout session?"
        message={pendingDelete ? `This will permanently delete the ${pendingDelete.workoutName} session from ${formatDisplayDate(pendingDelete.date)}.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
