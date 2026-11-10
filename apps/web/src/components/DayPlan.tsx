import {
  addDays,
  type Completion,
  conflicts,
  type EventRecord,
  type Occurrence,
  occurrences,
} from "@gungun/core";
import { setOccurrenceCompleted } from "@gungun/data";
import { useState } from "react";
import { tr } from "../i18n/tr";

type Props = {
  events: EventRecord[];
  completions: Completion[];
  date: string;
  edit: (id: string) => void;
  notify: (message: string) => void;
  add: () => void;
};
export function DayPlan({ events, completions, date, edit, notify, add }: Props) {
  const list = occurrences(events, date, date);
  const nearby = occurrences(events, addDays(date, -1), addDays(date, 1));
  const timed = list.filter((event) => event.time !== null);
  const flexible = list.filter((event) => event.time === null);
  return (
    <section className="section day-plan">
      <h2>{tr.dailyPlan}</h2>
      {!list.length && (
        <div className="empty">
          <h3>{tr.empty}</h3>
          <p>{tr.emptyHint}</p>
          <button type="button" onClick={add}>
            {tr.add}
          </button>
        </div>
      )}
      {timed.length > 0 && (
        <>
          <h3 className="list-label">{tr.timed}</h3>
          <ul className="event-list">
            {timed.map((event) => (
              <EventRow
                key={event.key}
                event={event}
                nearby={nearby}
                completions={completions}
                edit={edit}
                notify={notify}
              />
            ))}
          </ul>
        </>
      )}
      {flexible.length > 0 && (
        <>
          <h3 className="list-label">{tr.flexible}</h3>
          <ul className="event-list">
            {flexible.map((event) => (
              <EventRow
                key={event.key}
                event={event}
                nearby={nearby}
                completions={completions}
                edit={edit}
                notify={notify}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function EventRow({
  event,
  nearby,
  completions,
  edit,
  notify,
}: {
  event: Occurrence;
  nearby: Occurrence[];
  completions: Completion[];
  edit: Props["edit"];
  notify: Props["notify"];
}) {
  const complete = completions.some(
    (item) => item.eventId === event.eventId && item.date === event.date && !item.deletedAt,
  );
  const collisions = conflicts(
    event,
    nearby.filter((item) => item.key !== event.key),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      await setOccurrenceCompleted(event, !complete);
      notify(tr.saved);
    } catch {
      setError(tr.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className={`event-row ${complete ? "is-complete" : ""}`}>
      <div className="event-time">
        {event.time ?? tr.flexible}
        <small>{event.time ? `${event.durationMinutes} ${tr.minutes}` : tr.eventLabel}</small>
      </div>
      <div className="event-body">
        <h3>{event.title}</h3>
        {event.category && <p className="muted">{event.category}</p>}
        {event.note && <p className="event-note">{event.note}</p>}
        {complete && <p className="status-mark">{tr.completed}</p>}
        {collisions.length > 0 && (
          <p className="error">
            {tr.conflictTitle}: {collisions.map((item) => item.title).join(", ")}
          </p>
        )}
        <div className="row-actions">
          <button
            type="button"
            className="quiet"
            onClick={() => edit(event.eventId)}
            aria-label={`${tr.edit}: ${event.title}`}
          >
            {tr.edit}
          </button>
          <button
            type="button"
            disabled={busy}
            className="quiet"
            onClick={() => void toggle()}
            aria-label={`${complete ? tr.reopen : tr.complete}: ${event.title}`}
            aria-pressed={complete}
          >
            {busy ? tr.saving : complete ? tr.reopen : tr.complete}
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
