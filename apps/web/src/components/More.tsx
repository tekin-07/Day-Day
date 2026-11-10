import type { EventRecord, Settings } from "@gungun/core";
import { restoreEvent, saveSettings } from "@gungun/data";
import { useCallback, useEffect, useState } from "react";
import { tr } from "../i18n/tr";
import { Backup } from "./Backup";

type Props = {
  settings: Settings;
  events: EventRecord[];
  dirty: (value: boolean) => void;
  notify: (message: string) => void;
  history: () => void;
};
export function More({ settings, events, dirty, notify, history }: Props) {
  const [error, setError] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [backupDirty, setBackupDirty] = useState(false);
  useEffect(() => {
    dirty(noteDirty || backupDirty);
    return () => dirty(false);
  }, [noteDirty, backupDirty, dirty]);
  const update = async (patch: Partial<Pick<Settings, "theme" | "appearance" | "routineNote">>) => {
    setError("");
    try {
      await saveSettings(patch);
      notify(tr.saved);
    } catch {
      setError(tr.error);
    }
  };
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{tr.app}</p>
        <h1>{tr.more}</h1>
      </header>
      <section className="section">
        <h2>{tr.settings}</h2>
        <div className="stack">
          <label>
            {tr.theme}
            <select
              value={settings.theme}
              onChange={(e) => {
                const theme = e.target.value;
                if (theme === "cool" || theme === "paper" || theme === "balanced")
                  void update({ theme });
              }}
            >
              {(["cool", "paper", "balanced"] as const).map((theme) => (
                <option key={theme} value={theme}>
                  {tr[theme]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {tr.appearance}
            <select
              value={settings.appearance}
              onChange={(e) => {
                const appearance = e.target.value;
                if (appearance === "light" || appearance === "dark" || appearance === "system")
                  void update({ appearance });
              }}
            >
              {(["system", "light", "dark"] as const).map((value) => (
                <option key={value} value={value}>
                  {tr[value]}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">{tr.timeZone}</p>
          <RoutineNote
            value={settings.routineNote ?? ""}
            dirty={setNoteDirty}
            update={async (value) => {
              await saveSettings({ routineNote: value });
              notify(tr.saved);
            }}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
      <Storage meaningful={settings.createdAt > 0 || events.length > 0} />
      <Backup settings={settings} dirty={setBackupDirty} notify={notify} />
      <section className="section">
        <h2>{tr.history}</h2>
        <button type="button" onClick={history}>
          {tr.history}
        </button>
      </section>
      <DeletedEvents events={events.filter((event) => event.deletedAt)} notify={notify} />
      <section className="section">
        <h2>{tr.about}</h2>
        <p>{tr.aboutText}</p>
        <p>{tr.localRisk}</p>
        <p className="muted">{tr.version}</p>
      </section>
    </>
  );
}

function RoutineNote({
  value,
  dirty,
  update,
}: {
  value: string;
  dirty: Props["dirty"];
  update: (value: string) => Promise<void>;
}) {
  const [note, setNote] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dirty(note !== value);
    return () => dirty(false);
  }, [note, value, dirty]);
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await update(note);
      dirty(false);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <label>
        {tr.routine}
        <textarea
          rows={3}
          maxLength={10000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-describedby="routine-hint"
        />
      </label>
      <p className="muted" id="routine-hint">
        {tr.routineHint}
      </p>
      <button disabled={busy || note === value} type="submit">
        {busy ? tr.saving : tr.save}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function Storage({ meaningful }: { meaningful: boolean }) {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inspect = useCallback(async () => {
    try {
      if (navigator.storage?.estimate) setEstimate(await navigator.storage.estimate());
      if (navigator.storage?.persisted) setPersistent(await navigator.storage.persisted());
    } catch {
      setMessage(tr.storageUnknown);
    }
  }, []);
  useEffect(() => {
    void inspect();
  }, [inspect]);
  const request = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await navigator.storage.persist();
      setPersistent(result);
      if (!result) setMessage(tr.storageDeclined);
      await inspect();
    } catch {
      setMessage(tr.error);
    } finally {
      setBusy(false);
    }
  };
  const mb = (size: number) =>
    `${new Intl.NumberFormat(tr.locale, { maximumFractionDigits: 1 }).format(size / 1024 / 1024)} ${tr.mb}`;
  return (
    <section className="section">
      <h2>{tr.storage}</h2>
      <p>
        {persistent === null
          ? tr.storageUnknown
          : persistent
            ? tr.storagePersistent
            : tr.storageTemporary}
      </p>
      {estimate && (
        <p>
          {tr.storageUsage}: {mb(estimate.usage ?? 0)} / {mb(estimate.quota ?? 0)}
        </p>
      )}
      {!meaningful && <p className="muted">{tr.storageFirst}</p>}
      {typeof navigator.storage?.persist === "function" && !persistent && (
        <button type="button" disabled={!meaningful || busy} onClick={() => void request()}>
          {busy ? tr.preparing : tr.storageAsk}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}

function DeletedEvents({ events, notify }: { events: EventRecord[]; notify: Props["notify"] }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const undo = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await restoreEvent(id);
      notify(tr.saved);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="section">
      <h2>{tr.deleted}</h2>
      {events.length ? (
        <ul className="plain-list">
          {events.map((event) => (
            <li className="row" key={event.id}>
              <span>{event.title}</span>
              <button type="button" disabled={busy} onClick={() => void undo(event.id)}>
                {tr.undo}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{tr.noDeleted}</p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
