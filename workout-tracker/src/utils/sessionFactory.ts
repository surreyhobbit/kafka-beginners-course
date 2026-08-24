import type { ExerciseTemplate, LoggedExercise, LoggedSet, TrackingType, WorkoutSession, WorkoutTemplate } from '../types';
import { generateId } from './id';

function makeSet(setNumber: number, side: LoggedSet['side']): LoggedSet {
  return {
    setNumber,
    weightKg: null,
    reps: null,
    durationSeconds: null,
    side,
    completed: false,
  };
}

/** Builds the default set list for an exercise template based on its tracking type. */
export function buildDefaultSets(defaultSets: number, trackingType: TrackingType): LoggedSet[] {
  const isPerSide = trackingType === 'weight_reps_per_side' || trackingType === 'duration_per_side';
  if (!isPerSide) {
    return Array.from({ length: defaultSets }, (_, i) => makeSet(i + 1, null));
  }
  const left = Array.from({ length: defaultSets }, (_, i) => makeSet(i + 1, 'left' as const));
  const right = Array.from({ length: defaultSets }, (_, i) => makeSet(i + 1, 'right' as const));
  return [...left, ...right];
}

export function exerciseTemplateToLogged(template: ExerciseTemplate, isExtra = false): LoggedExercise {
  return {
    exerciseTemplateId: template.id,
    name: template.name,
    cue: template.cue,
    trackingType: template.trackingType,
    targetText: template.targetText,
    completed: false,
    notes: '',
    sets: buildDefaultSets(template.defaultSets, template.trackingType),
    isExtra,
  };
}

export function createSessionFromTemplate(template: WorkoutTemplate, date: string): WorkoutSession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    workoutTemplateId: template.id,
    workoutName: template.name,
    date,
    startedAt: now,
    completedAt: null,
    notes: '',
    status: 'in_progress',
    exercises: template.exercises.map((e) => exerciseTemplateToLogged(e)),
  };
}

export function createExtraExercise(
  name: string,
  trackingType: TrackingType,
  defaultSets: number,
  cue = '',
  targetText = '',
): LoggedExercise {
  return exerciseTemplateToLogged(
    {
      id: `extra-${generateId()}`,
      name,
      cue,
      defaultSets,
      trackingType,
      targetText,
    },
    true,
  );
}
