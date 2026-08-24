/** How a given exercise's sets are measured. */
export type TrackingType =
  | 'weight_reps'
  | 'duration'
  | 'weight_reps_per_side'
  | 'duration_per_side';

export interface ExerciseTemplate {
  id: string;
  name: string;
  cue: string;
  defaultSets: number;
  trackingType: TrackingType;
  targetText: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

export type SetSide = 'left' | 'right' | 'both' | null;

export interface LoggedSet {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  side: SetSide;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseTemplateId: string;
  name: string;
  cue: string;
  trackingType: TrackingType;
  targetText: string;
  completed: boolean;
  notes: string;
  sets: LoggedSet[];
  /** True when the user added this exercise ad hoc, outside the standard plan. */
  isExtra: boolean;
}

export type SessionStatus = 'in_progress' | 'completed';

export interface WorkoutSession {
  id: string;
  workoutTemplateId: string;
  workoutName: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** ISO datetime */
  startedAt: string;
  /** ISO datetime, null while in progress */
  completedAt: string | null;
  notes: string;
  status: SessionStatus;
  exercises: LoggedExercise[];
}

export interface DataExport {
  schemaVersion: 1;
  exportedAt: string;
  sessions: WorkoutSession[];
}
