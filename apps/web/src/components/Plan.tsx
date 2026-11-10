import {
  addDays,
  type Completion,
  type EventRecord,
  monthDates,
  occurrences,
  weekDates,
} from "@gungun/core";
import { useState } from "react";
import { formatDate } from "../display";
import { tr } from "../i18n/tr";
import { DayPlan } from "./DayPlan";

type Props = {
  events: EventRecord[];
  completions: Completion[];
  date: string;
  setDate: (date: string) => void;
  edit: (id: string) => void;
  notify: (message: string) => void;
  add: () => void;
  today: string;
};
export function Plan(props: Props) {
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const dates = view === "week" ? weekDates(props.date) : monthDates(props.date);
  const open = (date: string) => {
    props.setDate(date);
    setView("day");
  };
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{tr.app}</p>
        <h1>{tr.plan}</h1>
      </header>
      <fieldset className="segmented" aria-label={tr.plan}>
        {(["day", "week", "month"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {tr[value]}
          </button>
        ))}
      </fieldset>
      <div className="date-controls">
        <button type="button" onClick={() => props.setDate(addDays(props.date, -1))}>
          {tr.previous}
        </button>
        <button type="button" onClick={() => props.setDate(addDays(props.date, 1))}>
          {tr.following}
        </button>
      </div>
      <label>
        {tr.selectedDate}
        <input
          type="date"
          required
          value={props.date}
          onChange={(e) => {
            if (e.target.value) props.setDate(e.target.value);
          }}
        />
      </label>
      <div className="section-heading">
        <h2>{formatDate(props.date)}</h2>
        <button type="button" className="quiet" onClick={() => props.setDate(props.today)}>
          {tr.goToday}
        </button>
      </div>
      {view === "day" ? (
        <>
          <button type="button" className="primary full" onClick={props.add}>
            {tr.add}
          </button>
          <DayPlan {...props} />
        </>
      ) : (
        <div className={view === "month" ? "month-list" : "week-list"}>
          {dates.map((date) => (
            <DaySummary
              key={date}
              date={date}
              events={props.events}
              open={open}
              detailed={view === "week"}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DaySummary({
  date,
  events,
  open,
  detailed,
}: {
  date: string;
  events: EventRecord[];
  open: (date: string) => void;
  detailed: boolean;
}) {
  const items = occurrences(events, date, date);
  return (
    <section className="day-summary">
      <button
        type="button"
        className="day-open"
        onClick={() => open(date)}
        aria-label={`${formatDate(date)} · ${items.length} ${tr.eventCount} · ${tr.openDay}`}
      >
        <span>{formatDate(date, true)}</span>
        <span className="density">
          {items.length} {tr.eventCount}
        </span>
      </button>
      {detailed && (
        <ul className="summary-list">
          {items.map((item) => (
            <li key={item.key}>
              <span>{item.time ?? tr.flexible}</span> {item.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
