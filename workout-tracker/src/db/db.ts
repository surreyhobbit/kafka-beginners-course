import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DataExport, WorkoutSession } from '../types';

const DB_NAME = 'workout-tracker';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';

interface WorkoutTrackerDB extends DBSchema {
  sessions: {
    key: string;
    value: WorkoutSession;
    indexes: { 'by-date': string; 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<WorkoutTrackerDB>> | null = null;

function getDb(): Promise<IDBPDatabase<WorkoutTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WorkoutTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
        store.createIndex('by-date', 'date');
        store.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
}

export async function getAllSessions(): Promise<WorkoutSession[]> {
  const db = await getDb();
  return db.getAll(SESSIONS_STORE);
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  const db = await getDb();
  return db.get(SESSIONS_STORE, id);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const db = await getDb();
  await db.put(SESSIONS_STORE, session);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(SESSIONS_STORE, id);
}

export async function getInProgressSession(): Promise<WorkoutSession | undefined> {
  const all = await getAllSessions();
  const inProgress = all.filter((s) => s.status === 'in_progress');
  inProgress.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return inProgress[0];
}

export async function getCompletedSessions(): Promise<WorkoutSession[]> {
  const all = await getAllSessions();
  return all
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date) || (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
}

/** Most recent completed session (before/on `beforeDate`) that logged the given exercise. */
export async function getMostRecentExerciseLog(
  exerciseTemplateId: string,
  beforeDate: string,
): Promise<{ session: WorkoutSession; exerciseIndex: number } | undefined> {
  const completed = await getCompletedSessions();
  for (const session of completed) {
    if (session.date > beforeDate) continue;
    if (session.date === beforeDate) continue; // only prior sessions, not the one being edited
    const idx = session.exercises.findIndex((e) => e.exerciseTemplateId === exerciseTemplateId);
    if (idx !== -1) {
      return { session, exerciseIndex: idx };
    }
  }
  return undefined;
}

export async function exportAllData(): Promise<DataExport> {
  const sessions = await getAllSessions();
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    sessions,
  };
}

export async function importSessions(sessions: WorkoutSession[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SESSIONS_STORE, 'readwrite');
  await Promise.all([...sessions.map((s) => tx.store.put(s)), tx.done]);
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.clear(SESSIONS_STORE);
}
