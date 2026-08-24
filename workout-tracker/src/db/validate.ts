import type { LoggedExercise, LoggedSet, WorkoutSession } from '../types';

export interface ValidationResult {
  valid: WorkoutSession[];
  errors: string[];
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNullableNumber(v: unknown): v is number | null {
  return v === null || typeof v === 'number';
}

function validateSet(set: unknown, path: string, errors: string[]): set is LoggedSet {
  if (typeof set !== 'object' || set === null) {
    errors.push(`${path}: set is not an object`);
    return false;
  }
  const s = set as Record<string, unknown>;
  let ok = true;
  if (typeof s.setNumber !== 'number') {
    errors.push(`${path}: setNumber must be a number`);
    ok = false;
  }
  if (!isNullableNumber(s.weightKg)) {
    errors.push(`${path}: weightKg must be a number or null`);
    ok = false;
  }
  if (!isNullableNumber(s.reps)) {
    errors.push(`${path}: reps must be a number or null`);
    ok = false;
  }
  if (!isNullableNumber(s.durationSeconds)) {
    errors.push(`${path}: durationSeconds must be a number or null`);
    ok = false;
  }
  if (s.side !== null && s.side !== 'left' && s.side !== 'right' && s.side !== 'both') {
    errors.push(`${path}: side must be left, right, both, or null`);
    ok = false;
  }
  if (typeof s.completed !== 'boolean') {
    errors.push(`${path}: completed must be a boolean`);
    ok = false;
  }
  return ok;
}

function validateExercise(exercise: unknown, path: string, errors: string[]): exercise is LoggedExercise {
  if (typeof exercise !== 'object' || exercise === null) {
    errors.push(`${path}: exercise is not an object`);
    return false;
  }
  const e = exercise as Record<string, unknown>;
  let ok = true;
  if (!isString(e.exerciseTemplateId)) {
    errors.push(`${path}: exerciseTemplateId must be a string`);
    ok = false;
  }
  if (!isString(e.name)) {
    errors.push(`${path}: name must be a string`);
    ok = false;
  }
  if (!Array.isArray(e.sets)) {
    errors.push(`${path}: sets must be an array`);
    ok = false;
  } else {
    e.sets.forEach((set, i) => {
      if (!validateSet(set, `${path}.sets[${i}]`, errors)) ok = false;
    });
  }
  return ok;
}

export function validateSessions(data: unknown): ValidationResult {
  const errors: string[] = [];
  const valid: WorkoutSession[] = [];

  const sessions: unknown[] = Array.isArray(data)
    ? data
    : typeof data === 'object' && data !== null && Array.isArray((data as Record<string, unknown>).sessions)
      ? ((data as Record<string, unknown>).sessions as unknown[])
      : [];

  if (sessions.length === 0 && !Array.isArray(data) && !(data as Record<string, unknown>)?.sessions) {
    errors.push('File does not contain a "sessions" array or a top-level array of sessions.');
    return { valid, errors };
  }

  sessions.forEach((session, i) => {
    const path = `sessions[${i}]`;
    if (typeof session !== 'object' || session === null) {
      errors.push(`${path}: session is not an object`);
      return;
    }
    const s = session as Record<string, unknown>;
    let ok = true;
    if (!isString(s.id)) {
      errors.push(`${path}: id must be a string`);
      ok = false;
    }
    if (!isString(s.workoutTemplateId)) {
      errors.push(`${path}: workoutTemplateId must be a string`);
      ok = false;
    }
    if (!isString(s.workoutName)) {
      errors.push(`${path}: workoutName must be a string`);
      ok = false;
    }
    if (!isString(s.date)) {
      errors.push(`${path}: date must be a string`);
      ok = false;
    }
    if (!isString(s.startedAt)) {
      errors.push(`${path}: startedAt must be a string`);
      ok = false;
    }
    if (s.completedAt !== null && !isString(s.completedAt)) {
      errors.push(`${path}: completedAt must be a string or null`);
      ok = false;
    }
    if (s.status !== 'in_progress' && s.status !== 'completed') {
      errors.push(`${path}: status must be "in_progress" or "completed"`);
      ok = false;
    }
    if (!Array.isArray(s.exercises)) {
      errors.push(`${path}: exercises must be an array`);
      ok = false;
    } else {
      s.exercises.forEach((ex, j) => {
        if (!validateExercise(ex, `${path}.exercises[${j}]`, errors)) ok = false;
      });
    }
    if (ok) {
      valid.push(session as unknown as WorkoutSession);
    }
  });

  return { valid, errors };
}
