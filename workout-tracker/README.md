# Workout Tracker

A simple, local-first workout tracker for an alternating two-day gym routine
(Gym A / Gym B). No login, no backend, no cloud service — everything is
stored in your browser.

## Features

- **Today's Workout** — pick Gym A or Gym B, start a workout, check off sets
  as you go, and finish with one tap. Progress autosaves as you type, so a
  refresh or dropped connection at the gym won't lose your data.
- **Exercise logging** — each exercise shows its cue, target sets/reps, and
  your most recent performance (e.g. "Previous: 60 kg — 10, 10, 9"). Add or
  remove sets freely, and add extra exercises not in the standard plan.
- **History** — a filterable, expandable log of every completed workout.
- **Progress** — pick an exercise to see a table and lightweight chart of
  estimated one-rep max (or duration, for timed exercises) over time.
- **Settings / Data** — export all data to JSON, import a previous export,
  or clear everything, all with validation and confirmation prompts.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- IndexedDB (via the small [`idb`](https://github.com/jakearchibald/idb)
  helper library) for local storage — no server, no accounts

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). The app works
great on a phone browser — open it on your phone and add it to your home
screen for quick access at the gym.

### Other commands

```bash
npm run build      # Type-check and build a production bundle to dist/
npm run preview    # Serve the production build locally
npm run typecheck  # Type-check only, no build output
```

## Running in Docker (e.g. on your own VPS)

The app is a static site (no backend), so the container just builds it and
serves the files with nginx.

```bash
docker compose up -d --build
```

Then open `http://<your-server>:8080`. Edit the port mapping in
`docker-compose.yml` if 8080 is already taken, or put a reverse proxy
(nginx, Caddy, Traefik) in front of it for a domain name and HTTPS —
point the proxy at this container's port 8080 (or whatever you mapped it
to). To update after pulling new code: `docker compose up -d --build`
again.

Since everything runs client-side, each browser/device that visits your
server has its own independent, unshared copy of the workout data — the
container itself holds no data and there's nothing to back up on the
server side. Use the in-app JSON export if you want a backup.

## Your data

All workout data lives in your browser's IndexedDB, scoped to the origin
you load the app from. Nothing is sent anywhere. This means:

- Data does **not** sync between devices or browsers.
- Clearing your browser's site data for this app (or using a private/
  incognito window) will remove your history.
- Back up regularly via **Settings → Export to JSON**, especially before
  clearing browser data or switching devices.

To restore or move data, use **Settings → Choose file to import** with a
previously exported JSON file. Imported sessions are validated; invalid
entries are reported and skipped, and valid ones are still imported.

## Editing the standard workouts

Gym A and Gym B are defined in
[`src/data/workoutTemplates.ts`](./src/data/workoutTemplates.ts). Edit
exercise names, cues, target sets/rep ranges, or tracking type there — the
rest of the app (checklist, logging, history, progress) picks up the
change automatically. Existing history isn't affected, since each logged
session stores its own copy of exercise details.

## Architecture notes

- **Data model**: `WorkoutTemplate`/`ExerciseTemplate` describe the
  standard plan; `WorkoutSession`/`LoggedExercise`/`LoggedSet` describe
  what was actually logged. See [`src/types/index.ts`](./src/types/index.ts).
- **Storage**: a single `sessions` object store in IndexedDB
  (`src/db/db.ts`). An in-progress workout is just a session with
  `status: "in_progress"`; "Finish workout" flips it to `"completed"`.
  Reloading the app looks for an in-progress session and resumes it.
- **Per-side exercises** (e.g. step-ups, side planks) generate separate
  left/right sets so each side is tracked independently.
- **Routing**: `react-router-dom` with `HashRouter`, so the app works when
  served as static files with no server-side routing configuration.

## Limitations / assumptions

- Single-user, single-device by design (no accounts, no sync).
- Weight is always kilograms (no unit switching in v1).
- "Previous performance" only matches standard exercises by their stable
  template ID — an ad hoc "extra" exercise added in two different sessions
  won't be linked together as the same exercise, since each one gets a
  unique ID when added. Standard Gym A/Gym B exercises always match.
- The Progress chart is intentionally minimal (hand-rolled SVG, no charting
  library) to keep dependencies small; it favors legibility over detail.
