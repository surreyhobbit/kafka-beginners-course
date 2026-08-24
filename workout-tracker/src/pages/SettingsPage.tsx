import { useEffect, useRef, useState } from 'react';
import { clearAllData, exportAllData, getAllSessions, importSessions } from '../db/db';
import { validateSessions } from '../db/validate';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string; details?: string[] } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sessionCount, setSessionCount] = useState<number | null>(null);

  async function refreshCount() {
    setSessionCount((await getAllSessions()).length);
  }

  useEffect(() => {
    refreshCount();
  }, []);

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'success', text: `Exported ${data.sessions.length} workout session(s).` });
  }

  async function handleImportFile(file: File) {
    setMessage(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setMessage({ kind: 'error', text: 'That file is not valid JSON.' });
      return;
    }

    const { valid, errors } = validateSessions(parsed);

    if (valid.length === 0) {
      setMessage({ kind: 'error', text: 'No valid workout sessions found in this file.', details: errors.slice(0, 8) });
      return;
    }

    await importSessions(valid);
    await refreshCount();

    if (errors.length > 0) {
      setMessage({
        kind: 'error',
        text: `Imported ${valid.length} session(s), but skipped ${errors.length > valid.length ? 'some' : errors.length} invalid entr${errors.length === 1 ? 'y' : 'ies'}.`,
        details: errors.slice(0, 8),
      });
    } else {
      setMessage({ kind: 'success', text: `Imported ${valid.length} session(s) successfully.` });
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
    e.target.value = '';
  }

  async function handleClearAll() {
    await clearAllData();
    await refreshCount();
    setShowClearConfirm(false);
    setMessage({ kind: 'success', text: 'All local workout data has been cleared.' });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Settings &amp; Data</h2>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        All data stays on this device, stored in your browser&rsquo;s local database. There is no account, login, or cloud sync — use export
        regularly if you want a backup.
      </p>

      {sessionCount !== null && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {sessionCount} workout session{sessionCount === 1 ? '' : 's'} stored locally.
        </p>
      )}

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.kind === 'success'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <p className="font-medium">{message.text}</p>
          {message.details && message.details.length > 0 && (
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs opacity-90">
              {message.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Export data</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Download all your workout history as a JSON file.</p>
        <button
          type="button"
          onClick={handleExport}
          className="tap-target w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Export to JSON
        </button>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Import data</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Load a previously exported JSON file. Existing sessions with the same ID are overwritten.</p>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={onFileSelected} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="tap-target w-full rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Choose file to import
        </button>
      </section>

      <section className="space-y-2 rounded-xl border border-rose-300 bg-white p-4 dark:border-rose-900 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Clear all data</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Permanently deletes every workout session stored on this device. Export a backup first if you might need it.</p>
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="tap-target w-full rounded-lg border border-rose-400 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
        >
          Clear all local data
        </button>
      </section>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all local data?"
        message="This permanently deletes every workout session on this device. This cannot be undone."
        confirmLabel="Clear everything"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
