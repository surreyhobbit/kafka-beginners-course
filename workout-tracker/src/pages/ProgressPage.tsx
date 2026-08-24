import { useEffect, useMemo, useState } from 'react';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import type { WorkoutSession } from '../types';
import { getCompletedSessions } from '../db/db';
import { estimateOneRepMax } from '../utils/oneRepMax';
import { formatShortDate } from '../utils/date';
import EmptyState from '../components/EmptyState';
import LineChart from '../components/LineChart';

interface DataPoint {
  date: string;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  estimatedOneRepMax: number | null;
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  useEffect(() => {
    (async () => {
      const completed = await getCompletedSessions();
      setSessions(completed);
      setLoading(false);
    })();
  }, []);

  const exerciseOptions = useMemo(() => {
    const names = new Map<string, string>();
    WORKOUT_TEMPLATES.forEach((w) => w.exercises.forEach((e) => names.set(e.id, e.name)));
    sessions.forEach((s) => s.exercises.forEach((e) => names.set(e.exerciseTemplateId, e.name)));
    return Array.from(names.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  useEffect(() => {
    if (!selectedExerciseId && exerciseOptions.length > 0) {
      setSelectedExerciseId(exerciseOptions[0][0]);
    }
  }, [exerciseOptions, selectedExerciseId]);

  const { isDuration, points } = useMemo(() => {
    const relevant = sessions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((s) => s.exercises.filter((e) => e.exerciseTemplateId === selectedExerciseId).map((e) => ({ session: s, exercise: e })));

    const duration = relevant.some((r) => r.exercise.trackingType === 'duration' || r.exercise.trackingType === 'duration_per_side');

    const data: DataPoint[] = relevant
      .map(({ session, exercise }): DataPoint | null => {
        const doneSets = exercise.sets.filter((s) => s.completed);
        if (duration) {
          const best = doneSets.reduce<number | null>((max, s) => (s.durationSeconds != null && (max === null || s.durationSeconds > max) ? s.durationSeconds : max), null);
          if (best === null) return null;
          return { date: session.date, weightKg: null, reps: null, durationSeconds: best, estimatedOneRepMax: null };
        }
        let best: { weightKg: number; reps: number; oneRm: number } | null = null;
        for (const s of doneSets) {
          if (s.weightKg == null || s.reps == null) continue;
          const oneRm = estimateOneRepMax(s.weightKg, s.reps);
          if (!best || oneRm > best.oneRm) best = { weightKg: s.weightKg, reps: s.reps, oneRm };
        }
        if (!best) return null;
        return { date: session.date, weightKg: best.weightKg, reps: best.reps, durationSeconds: null, estimatedOneRepMax: best.oneRm };
      })
      .filter((d): d is DataPoint => d !== null);

    return { isDuration: duration, points: data };
  }, [sessions, selectedExerciseId]);

  const chartPoints = useMemo(
    () =>
      points.map((p) => ({
        label: formatShortDate(p.date),
        value: isDuration ? (p.durationSeconds ?? 0) : (p.estimatedOneRepMax ?? 0),
      })),
    [points, isDuration],
  );

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Progress</h2>

      {exerciseOptions.length === 0 ? (
        <EmptyState message="No workout history yet — complete Gym A or Gym B to start tracking progress." />
      ) : (
        <>
          <label className="block text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Exercise</span>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="tap-target mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {exerciseOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          {points.length === 0 ? (
            <EmptyState message="No completed sets logged yet for this exercise." />
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {isDuration ? 'Best duration per session' : 'Estimated one-rep max per session'}
                </p>
                <LineChart points={chartPoints} unit={isDuration ? 's' : 'kg'} />
              </div>

              {!isDuration && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimated 1RM = weight × (1 + reps ÷ 30). This is only a trend estimate based on your logged sets, not a tested maximum.
                </p>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      {isDuration ? (
                        <th className="px-3 py-2">Duration</th>
                      ) : (
                        <>
                          <th className="px-3 py-2">Weight</th>
                          <th className="px-3 py-2">Reps</th>
                          <th className="px-3 py-2">Est. 1RM</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {points
                      .slice()
                      .reverse()
                      .map((p, i) => (
                        <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="px-3 py-2">{formatShortDate(p.date)}</td>
                          {isDuration ? (
                            <td className="px-3 py-2">{p.durationSeconds}s</td>
                          ) : (
                            <>
                              <td className="px-3 py-2">{p.weightKg} kg</td>
                              <td className="px-3 py-2">{p.reps}</td>
                              <td className="px-3 py-2">{p.estimatedOneRepMax?.toFixed(1)} kg</td>
                            </>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
