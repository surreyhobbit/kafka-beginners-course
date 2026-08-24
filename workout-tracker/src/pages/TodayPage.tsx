import { useEffect, useMemo, useRef, useState } from 'react';
import { WORKOUT_TEMPLATES, getWorkoutTemplate } from '../data/workoutTemplates';
import type { LoggedExercise, TrackingType, WorkoutSession } from '../types';
import { deleteSession, getInProgressSession, getMostRecentExerciseLog, saveSession } from '../db/db';
import { createExtraExercise, createSessionFromTemplate } from '../utils/sessionFactory';
import { formatPreviousPerformance } from '../utils/previousPerformance';
import { todayIso } from '../utils/date';
import ExerciseCard from '../components/ExerciseCard';
import AddExerciseDialog from '../components/AddExerciseDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import SavedIndicator from '../components/SavedIndicator';

const LAST_GYM_KEY = 'workout-tracker-last-gym';

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(() => localStorage.getItem(LAST_GYM_KEY) || WORKOUT_TEMPLATES[0].id);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [previousMap, setPreviousMap] = useState<Record<string, string | null>>({});
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [finishedBanner, setFinishedBanner] = useState<string | null>(null);

  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const inProgress = await getInProgressSession();
      if (inProgress) {
        setSession(inProgress);
        setSelectedWorkoutId(inProgress.workoutTemplateId);
        setSelectedDate(inProgress.date);
        await loadPreviousMap(inProgress);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!session) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveSession(session);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadPreviousMap(current: WorkoutSession) {
    const entries = await Promise.all(
      current.exercises
        .filter((e) => !e.isExtra)
        .map(async (e) => {
          const found = await getMostRecentExerciseLog(e.exerciseTemplateId, current.date);
          const text = found ? formatPreviousPerformance(found.session.exercises[found.exerciseIndex]) : null;
          return [e.exerciseTemplateId, text] as const;
        }),
    );
    setPreviousMap(Object.fromEntries(entries));
  }

  const template = getWorkoutTemplate(selectedWorkoutId) ?? WORKOUT_TEMPLATES[0];

  const completedCount = session ? session.exercises.filter((e) => e.completed).length : 0;
  const totalCount = session ? session.exercises.length : 0;

  const firstIncompleteIndex = useMemo(() => {
    if (!session) return -1;
    return session.exercises.findIndex((e) => !e.completed);
  }, [session]);

  function selectWorkout(id: string) {
    if (session) return;
    setSelectedWorkoutId(id);
    localStorage.setItem(LAST_GYM_KEY, id);
  }

  async function startWorkout() {
    const newSession = createSessionFromTemplate(template, selectedDate);
    await saveSession(newSession);
    setSession(newSession);
    setFinishedBanner(null);
    await loadPreviousMap(newSession);
  }

  async function discardWorkout() {
    if (!session) return;
    await deleteSession(session.id);
    setSession(null);
    setShowDiscardConfirm(false);
  }

  async function finishWorkout() {
    if (!session) return;
    const finished: WorkoutSession = { ...session, status: 'completed', completedAt: new Date().toISOString() };
    await saveSession(finished);
    setFinishedBanner(`Workout saved — ${finished.exercises.filter((e) => e.completed).length} of ${finished.exercises.length} exercises completed.`);
    setSession(null);
  }

  function updateExerciseAt(index: number, updated: LoggedExercise) {
    if (!session) return;
    const exercises = session.exercises.slice();
    exercises[index] = updated;
    setSession({ ...session, exercises });
  }

  function removeExerciseAt(index: number) {
    if (!session) return;
    setSession({ ...session, exercises: session.exercises.filter((_, i) => i !== index) });
  }

  function addExtraExercise(name: string, trackingType: TrackingType, sets: number) {
    if (!session) return;
    const exercise = createExtraExercise(name, trackingType, sets);
    setSession({ ...session, exercises: [...session.exercises, exercise] });
    setShowAddExercise(false);
  }

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Today&rsquo;s Workout</h2>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Choose workout">
        {WORKOUT_TEMPLATES.map((w) => (
          <button
            key={w.id}
            role="tab"
            aria-selected={selectedWorkoutId === w.id}
            disabled={!!session}
            onClick={() => selectWorkout(w.id)}
            className={`tap-target flex-1 rounded-lg border px-3 text-sm font-semibold transition-colors ${
              selectedWorkoutId === w.id
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            } ${session ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {w.name}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">Date</span>
        <input
          type="date"
          value={selectedDate}
          disabled={!!session}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="tap-target flex-1 rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-60"
        />
      </label>

      {finishedBanner && (
        <div className="rounded-lg border border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✅ {finishedBanner}
        </div>
      )}

      {!session ? (
        <button
          type="button"
          onClick={startWorkout}
          className="tap-target w-full rounded-lg bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Start workout
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold">
                {completedCount} of {totalCount} exercises completed
              </p>
              <div className="mt-1.5 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <SavedIndicator visible={showSaved} />
          </div>

          <div className="space-y-3">
            {session.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.exerciseTemplateId}-${index}`}
                exercise={exercise}
                previousText={previousMap[exercise.exerciseTemplateId] ?? null}
                isActive={index === firstIncompleteIndex}
                defaultOpen={index === firstIncompleteIndex}
                onChange={(updated) => updateExerciseAt(index, updated)}
                onRemove={exercise.isExtra ? () => removeExerciseAt(index) : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddExercise(true)}
            className="tap-target w-full rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + Add extra exercise
          </button>

          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="tap-target flex-1 rounded-lg border border-rose-300 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
            >
              Discard workout
            </button>
            <button
              type="button"
              onClick={finishWorkout}
              className="tap-target flex-[2] rounded-lg bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-500"
            >
              Finish workout
            </button>
          </div>
        </>
      )}

      <AddExerciseDialog open={showAddExercise} onCancel={() => setShowAddExercise(false)} onAdd={addExtraExercise} />
      <ConfirmDialog
        open={showDiscardConfirm}
        title="Discard this workout?"
        message="This will delete the in-progress workout and everything logged so far. This cannot be undone."
        confirmLabel="Discard"
        danger
        onConfirm={discardWorkout}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </div>
  );
}
