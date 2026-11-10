import {
  addDays,
  type EventDraft,
  type EventRecord,
  type Frequency,
  isLocalDate,
  isLocalTime,
  occurrences,
} from "@gungun/core";
export function withFrequency(draft: EventDraft, frequency: Frequency): EventDraft {
  return { ...draft, frequency, weekdays: frequency === "weekly" ? draft.weekdays : [] };
}
export function firstPreviewOccurrence(draft: EventDraft, editing: boolean, today: string) {
  const from = editing ? ([today, draft.startDate].sort().at(-1) ?? today) : draft.startDate;
  const candidate: EventRecord = {
    ...draft,
    id: "preview",
    createdAt: 0,
    updatedAt: 0,
    versions: [{ ...draft, effectiveFrom: from }],
  };
  // A monthly anchor is at most 31 days away; the first occurrence is the preview boundary.
  return occurrences([candidate], from, addDays(from, 31))[0];
}

export function eventFieldErrors(draft: EventDraft) {
  return {
    title: !draft.title.trim() || draft.title.length > 200,
    date: !isLocalDate(draft.startDate),
    time: draft.time !== null && !isLocalTime(draft.time),
    duration:
      draft.time !== null &&
      (!Number.isSafeInteger(draft.durationMinutes) || draft.durationMinutes <= 0),
    weekdays: draft.frequency === "weekly" && draft.weekdays.length === 0,
  };
}
