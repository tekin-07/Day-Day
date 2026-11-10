import {
  addDays,
  conflicts,
  type EventDraft,
  type EventRecord,
  localDate,
  type Occurrence,
  occurrences,
  suggestTime,
} from "@gungun/core";
import { deleteEvent, saveEvent } from "@gungun/data";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "../display";
import { eventFieldErrors, firstPreviewOccurrence } from "../event-preview";
import { tr } from "../i18n/tr";
import { EventFields } from "./EventFields";
import { Modal } from "./Modal";

const initialDraft = (date: string, event?: EventRecord): EventDraft =>
  event
    ? {
        title: event.title,
        startDate: event.startDate,
        time: event.time,
        durationMinutes: event.durationMinutes,
        frequency: event.frequency,
        weekdays: [...event.weekdays],
        note: event.note,
        category: event.category,
      }
    : {
        title: "",
        startDate: date,
        time: "09:00",
        durationMinutes: 30,
        frequency: "once",
        weekdays: [],
        note: "",
        category: "",
      };

type Props = {
  date: string;
  event?: EventRecord;
  events: EventRecord[];
  close: () => void;
  saved: (message: string) => void;
  dirty: (value: boolean) => void;
};
export function EventForm({ date, event, events, close, saved, dirty }: Props) {
  const [draft, setDraft] = useState(() => initialDraft(date, event));
  const [attempts, setAttempts] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const errors = attempts ? eventFieldErrors(draft) : undefined;
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [collision, setCollision] = useState<Occurrence[] | null>(null);
  const [suggested, setSuggested] = useState<string | null | undefined>();
  useEffect(() => {
    dirty(changed);
    return () => dirty(false);
  }, [changed, dirty]);
  useEffect(() => {
    if (error && attempts) summary.current?.focus();
  }, [error, attempts]);
  const patch = (value: Partial<EventDraft>) => {
    setChanged(true);
    setError("");
    setDraft((old) => ({ ...old, ...value }));
  };
  const persist = async (value = draft) => {
    setBusy(true);
    setError("");
    try {
      await saveEvent(value, event?.id);
      setChanged(false);
      dirty(false);
      saved(tr.saved);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  const submit = () => {
    setAttempts((count) => count + 1);
    if (Object.values(eventFieldErrors(draft)).some(Boolean)) {
      setError(tr.formError);
      return;
    }
    const candidate = firstPreviewOccurrence(draft, Boolean(event), localDate(Date.now()));
    const nearby = candidate
      ? occurrences(
          events.filter((item) => item.id !== event?.id),
          addDays(candidate.date, -1),
          addDays(candidate.date, 1),
        )
      : [];
    const found = candidate ? conflicts(candidate, nearby) : [];
    if (candidate && found.length) {
      setCollision([candidate, ...found]);
      setSuggested(undefined);
    } else void persist();
  };
  const remove = async () => {
    if (!event) return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      setChanged(false);
      dirty(false);
      saved(tr.deletedNotice);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={event ? tr.editSeries : tr.add} description={tr.seriesHint} close={close} wide>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <fieldset disabled={busy}>
          <EventFields draft={draft} patch={patch} errors={errors} />
          {error && (
            <div className="error" role="alert" ref={summary} tabIndex={-1}>
              {error}
              {errors && (
                <ul>
                  {Object.entries(errors)
                    .filter(([, invalid]) => invalid)
                    .map(([field]) => (
                      <li key={field}>
                        <a href={`#event-${field}`}>{tr[field as keyof typeof errors]}</a>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
          <div className="actions">
            <button className="primary" type="submit">
              {busy ? tr.saving : tr.save}
            </button>
            <button type="button" onClick={close}>
              {tr.cancel}
            </button>
          </div>
          {event && (
            <button type="button" className="danger full" onClick={() => setDeleting(true)}>
              {tr.remove}
            </button>
          )}
        </fieldset>
      </form>
      {deleting && (
        <Modal
          title={tr.deleteTitle}
          description={tr.deleteText}
          close={() => {
            if (!busy) setDeleting(false);
          }}
        >
          <div className="stack">
            <button type="button" disabled={busy} className="danger" onClick={() => void remove()}>
              {tr.confirmDelete}
            </button>
            <button type="button" disabled={busy} onClick={() => setDeleting(false)}>
              {tr.cancel}
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </Modal>
      )}
      {collision && (
        <Modal
          title={tr.conflictTitle}
          description={tr.conflictText}
          close={() => setCollision(null)}
        >
          <p>{tr.conflictHorizon}</p>
          <ul className="plain-list">
            {collision.map((item) => (
              <li key={item.key}>
                <strong>{item.title}</strong>
                <br />
                {formatDate(item.date, true)} · {item.time} · {item.durationMinutes} {tr.minutes}
              </li>
            ))}
          </ul>
          {suggested !== undefined && (
            <p role="status">{suggested ? `${tr.suggestion}: ${suggested}` : tr.noSuggestion}</p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="stack">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const candidate = collision[0];
                if (candidate)
                  setSuggested(
                    suggestTime(
                      candidate,
                      occurrences(
                        events.filter((item) => item.id !== event?.id),
                        addDays(candidate.date, -1),
                        addDays(candidate.date, 1),
                      ),
                    ),
                  );
              }}
            >
              {tr.suggest}
            </button>
            {suggested && (
              <button
                type="button"
                disabled={busy}
                className="primary"
                onClick={() => void persist({ ...draft, time: suggested })}
              >
                {tr.useSuggestion}
              </button>
            )}
            <button type="button" disabled={busy} onClick={() => void persist()}>
              {tr.conflictSave}
            </button>
            <button type="button" disabled={busy} onClick={() => setCollision(null)}>
              {tr.cancel}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
