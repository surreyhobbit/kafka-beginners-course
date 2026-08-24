import type { WorkoutTemplate } from '../types';

/**
 * The standard alternating workout plan. Edit exercises, cues, target sets,
 * and rep ranges here — everything else in the app reads from this file.
 */
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'gym-a',
    name: 'Gym A',
    exercises: [
      {
        id: 'gym-a-leg-press',
        name: 'Leg press',
        cue: 'Whole foot on platform; knees track over toes; use a pain-free depth.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-10 reps',
      },
      {
        id: 'gym-a-seated-cable-row',
        name: 'Seated cable row',
        cue: 'Keep chest tall; pull elbows toward hips; avoid shrugging.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-12 reps',
      },
      {
        id: 'gym-a-db-romanian-deadlift',
        name: 'Dumbbell Romanian deadlift',
        cue: 'Keep soft knees; move hips back; maintain a neutral spine.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-10 reps',
      },
      {
        id: 'gym-a-machine-chest-press',
        name: 'Machine chest press',
        cue: 'Keep shoulder blades gently back; press smoothly.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-12 reps',
      },
      {
        id: 'gym-a-lat-pulldown',
        name: 'Lat pulldown',
        cue: 'Pull toward upper chest; drive elbows down; avoid leaning back excessively.',
        defaultSets: 2,
        trackingType: 'weight_reps',
        targetText: '2 sets x 8-12 reps',
      },
      {
        id: 'gym-a-pallof-press-or-plank',
        name: 'Pallof press or plank',
        cue: 'Keep ribs down and resist twisting or arching.',
        defaultSets: 2,
        trackingType: 'duration',
        targetText: '2 sets x 10 reps/side, or 25-35 seconds',
      },
    ],
  },
  {
    id: 'gym-b',
    name: 'Gym B',
    exercises: [
      {
        id: 'gym-b-step-up-or-split-squat',
        name: 'Step-up or split squat',
        cue: 'Lower slowly; keep knee aligned with the middle toes.',
        defaultSets: 3,
        trackingType: 'weight_reps_per_side',
        targetText: '3 sets x 8 reps per leg',
      },
      {
        id: 'gym-b-hip-thrust-or-hamstring-curl',
        name: 'Hip thrust or hamstring curl',
        cue: 'Squeeze glutes and hamstrings; do not over-arch the lower back.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-12 reps',
      },
      {
        id: 'gym-b-db-incline-press',
        name: 'Dumbbell incline press',
        cue: 'Use a controlled range; keep elbows slightly tucked.',
        defaultSets: 3,
        trackingType: 'weight_reps',
        targetText: '3 sets x 8-12 reps',
      },
      {
        id: 'gym-b-one-arm-row',
        name: 'One-arm cable or dumbbell row',
        cue: 'Keep torso still and pull the elbow back.',
        defaultSets: 3,
        trackingType: 'weight_reps_per_side',
        targetText: '3 sets x 8-12 reps per side',
      },
      {
        id: 'gym-b-calf-raise',
        name: 'Calf raise',
        cue: 'Pause briefly at the bottom stretch and at the top.',
        defaultSets: 2,
        trackingType: 'weight_reps',
        targetText: '2 sets x 12-15 reps',
      },
      {
        id: 'gym-b-side-plank-or-dead-bug',
        name: 'Side plank or dead bug',
        cue: 'Keep pelvis and ribs controlled.',
        defaultSets: 2,
        trackingType: 'duration_per_side',
        targetText: '2 sets x 20-30 seconds per side, or 8-10 reps per side',
      },
    ],
  },
];

export function getWorkoutTemplate(id: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((w) => w.id === id);
}

export function getExerciseTemplate(exerciseTemplateId: string) {
  for (const workout of WORKOUT_TEMPLATES) {
    const found = workout.exercises.find((e) => e.id === exerciseTemplateId);
    if (found) return found;
  }
  return undefined;
}
