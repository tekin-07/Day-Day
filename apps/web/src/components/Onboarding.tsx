import { saveSettings } from "@gungun/data";
import { useEffect, useState } from "react";
import { tr } from "../i18n/tr";

export function Onboarding({ dirty }: { dirty: (value: boolean) => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dirty(Boolean(note));
    return () => dirty(false);
  }, [note, dirty]);
  const start = async () => {
    setBusy(true);
    setError("");
    try {
      await saveSettings({ onboarded: true, routineNote: note });
      dirty(false);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="onboarding">
      <p className="eyebrow">{tr.app}</p>
      <h1>{tr.welcome}</h1>
      <p>{tr.localOnly}</p>
      <p className="notice">{tr.localRisk}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void start();
        }}
      >
        <label>
          {tr.routine}
          <textarea
            maxLength={10000}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-describedby="onboard-routine"
          />
        </label>
        <p className="muted" id="onboard-routine">
          {tr.routineHint}
        </p>
        <button className="primary full" type="submit" disabled={busy}>
          {busy ? tr.saving : tr.start}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
