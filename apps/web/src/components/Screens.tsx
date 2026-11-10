import {
  type Completion,
  type EventRecord,
  localDate,
  occurrences,
  type Settings,
} from "@gungun/core";
import { CalendarBlank, House, List, Notebook } from "@phosphor-icons/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentInstant } from "../clock";
import { formatDate } from "../display";
import { tr } from "../i18n/tr";
import { DayPlan } from "./DayPlan";
import { EventForm } from "./EventForm";
import { History } from "./History";
import { More } from "./More";
import { Plan } from "./Plan";

type Snapshot = { settings: Settings; events: EventRecord[]; completions: Completion[] };
export function Screens({
  snapshot,
  dirty,
  notify,
  saved,
}: {
  snapshot: Snapshot;
  dirty: (value: boolean) => void;
  notify: (message: string) => void;
  saved: (message: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const now = useCurrentInstant();
  const today = localDate(now);
  const [date, setDate] = useState(today);
  const edit = (id: string) => {
    void navigate(`/events/${id}`);
  };
  const add = () => {
    void navigate(`/events/new?date=${location.pathname === "/plan" ? date : today}`);
  };
  const eventPath = location.pathname.startsWith("/events/");
  const id = location.pathname.split("/")[2];
  const event =
    id !== "new" ? snapshot.events.find((item) => item.id === id && !item.deletedAt) : undefined;
  const common = { ...snapshot, edit, notify, add };
  return (
    <>
      {location.pathname === "/more" ? (
        <More
          {...snapshot}
          dirty={dirty}
          notify={notify}
          history={() => {
            void navigate("/history");
          }}
        />
      ) : location.pathname === "/history" ? (
        <History
          completions={snapshot.completions}
          back={() => {
            void navigate("/more");
          }}
        />
      ) : location.pathname === "/plan" ? (
        <Plan {...common} today={today} date={date} setDate={setDate} />
      ) : (
        <Today {...common} date={today} now={now} />
      )}
      {eventPath && (id === "new" || event) && (
        <EventForm
          key={location.key}
          event={event}
          date={new URLSearchParams(location.search).get("date") ?? today}
          events={snapshot.events}
          dirty={dirty}
          saved={saved}
          close={() => {
            if (window.history.state?.idx > 0) void navigate(-1);
            else void navigate("/today");
          }}
        />
      )}
    </>
  );
}

function Today({
  events,
  completions,
  date,
  edit,
  notify,
  add,
  now,
}: {
  events: EventRecord[];
  completions: Completion[];
  date: string;
  now: number;
  edit: (id: string) => void;
  notify: (message: string) => void;
  add: () => void;
}) {
  const currentTime = new Intl.DateTimeFormat(tr.locale, {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const next = occurrences(events, date, date).find(
    (event) =>
      event.time !== null &&
      event.time >= currentTime &&
      !completions.some(
        (item) => item.eventId === event.eventId && item.date === date && !item.deletedAt,
      ),
  );
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{formatDate(date)}</p>
        <h1>{tr.today}</h1>
      </header>
      <section className="next-event">
        <p className="eyebrow">{tr.next}</p>
        <h2>{next?.title ?? tr.noNext}</h2>
        {next ? (
          <>
            <p className="next-time">
              {next.time}
              <span>
                {" "}
                · {next.durationMinutes} {tr.minutes}
              </span>
            </p>
            <button type="button" onClick={() => edit(next.eventId)}>
              {tr.edit}
            </button>
          </>
        ) : (
          <p className="muted">{tr.noNextHint}</p>
        )}
      </section>
      <button type="button" className="primary full add-event" onClick={add}>
        {tr.add}
      </button>
      <DayPlan
        events={events}
        completions={completions}
        date={date}
        edit={edit}
        notify={notify}
        add={add}
      />
    </>
  );
}

export function Navigation({ current, go }: { current: string; go: (path: string) => void }) {
  const items = [
    { path: "/today", text: tr.today, icon: House },
    { path: "/plan", text: tr.plan, icon: CalendarBlank },
    { path: "/records", text: tr.records, icon: Notebook },
    { path: "/more", text: tr.more, icon: List },
  ];
  return (
    <>
      <div className="navigation-shell">
        <nav className="bottom-nav" aria-label={tr.app}>
          {items.map(({ path, text, icon: Icon }) => (
            <button
              type="button"
              key={path}
              disabled={path === "/records"}
              aria-current={
                current === path || (path === "/today" && current.startsWith("/events/"))
                  ? "page"
                  : undefined
              }
              aria-describedby={path === "/records" ? "records-hint" : undefined}
              onClick={() => go(path)}
            >
              <Icon size={24} aria-hidden="true" />
              <span>{text}</span>
            </button>
          ))}
        </nav>
        <p className="nav-hint" id="records-hint">
          {tr.future}
        </p>
      </div>
    </>
  );
}
