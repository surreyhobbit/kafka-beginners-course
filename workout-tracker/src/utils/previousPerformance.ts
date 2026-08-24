import type { LoggedExercise, LoggedSet } from '../types';

function isPerSideType(trackingType: LoggedExercise['trackingType']): boolean {
  return trackingType === 'weight_reps_per_side' || trackingType === 'duration_per_side';
}

function isDurationType(trackingType: LoggedExercise['trackingType']): boolean {
  return trackingType === 'duration' || trackingType === 'duration_per_side';
}

function formatSide(sets: LoggedSet[], isDuration: boolean): string {
  const values = sets.map((s) => {
    if (isDuration) return s.durationSeconds != null ? `${s.durationSeconds}s` : '-';
    return s.reps != null ? `${s.reps}` : '-';
  });
  const weight = sets.find((s) => s.weightKg != null)?.weightKg;
  const prefix = !isDuration && weight != null ? `${weight} kg — ` : '';
  return `${prefix}${values.join(', ')}`;
}

/** Builds a "Previous: 60 kg — 10, 10, 9" style summary from a past logged exercise. */
export function formatPreviousPerformance(exercise: LoggedExercise): string | null {
  const perSide = isPerSideType(exercise.trackingType);
  const duration = isDurationType(exercise.trackingType);

  if (perSide) {
    const left = exercise.sets.filter((s) => s.side === 'left' && s.completed);
    const right = exercise.sets.filter((s) => s.side === 'right' && s.completed);
    const parts: string[] = [];
    if (left.length) parts.push(`L ${formatSide(left, duration)}`);
    if (right.length) parts.push(`R ${formatSide(right, duration)}`);
    if (!parts.length) return null;
    return `Previous — ${parts.join('  ·  ')}`;
  }

  const done = exercise.sets.filter((s) => s.completed);
  if (!done.length) return null;
  if (duration) {
    return `Previous: ${formatSide(done, true)}`;
  }
  const weight = done.find((s) => s.weightKg != null)?.weightKg;
  const reps = done.map((s) => (s.reps != null ? `${s.reps}` : '-')).join(', ');
  return weight != null ? `Previous: ${weight} kg — ${reps}` : `Previous: ${reps} reps`;
}
