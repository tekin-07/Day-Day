import type { Completion } from "@gungun/core";
import { formatDate, formatInstant } from "../display";
import { tr } from "../i18n/tr";

export function History({ completions, back }: { completions: Completion[]; back: () => void }) {
  const items = completions
    .filter((item) => !item.deletedAt)
    .sort((a, b) => b.completedAt - a.completedAt);
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{tr.app}</p>
        <h1>{tr.history}</h1>
      </header>
      <button type="button" onClick={back}>
        {tr.back}
      </button>
      <p>{tr.historyHint}</p>
      {items.length ? (
        <ul className="plain-list">
          {items.map((item) => (
            <li key={item.id}>
              <h2>{item.title}</h2>
              <p>
                {formatDate(item.date)} · {item.time ?? tr.flexible}
              </p>
              <p className="muted">
                {tr.completed}: {formatInstant(item.completedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">{tr.noHistory}</p>
      )}
    </>
  );
}
