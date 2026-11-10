import type { EventRecord, EventVersion, Occurrence } from "./models";
import { addDays, minuteIndex, repeatsOn, timeAtMinute, timeMinute } from "./time";

function schedule(event: EventRecord, date: string): EventVersion | undefined {
  const versions = event.versions.length
    ? event.versions
    : [{ ...event, effectiveFrom: event.startDate }];
  return [...versions].reverse().find((version) => version.effectiveFrom <= date);
}
export function occurrences(events: EventRecord[], from: string, to: string): Occurrence[] {
  const result: Occurrence[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    for (const event of events) {
      if (event.deletedAt !== undefined) continue;
      const version = schedule(event, date);
      if (!version || !repeatsOn(version.startDate, date, version.frequency, version.weekdays))
        continue;
      const { title, time, durationMinutes, note, category } = version;
      result.push({
        key: `${event.id}/${date}`,
        eventId: event.id,
        date,
        title,
        time,
        durationMinutes,
        note,
        category,
      });
    }
  }
  return result.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? "99:99").localeCompare(b.time ?? "99:99") ||
      a.eventId.localeCompare(b.eventId),
  );
}
export function conflicts(candidate: Occurrence, others: Occurrence[]): Occurrence[] {
  if (candidate.time === null) return [];
  const start = minuteIndex(candidate.date, candidate.time);
  const end = start + candidate.durationMinutes;
  return others.filter((other) => {
    if (other.time === null || other.key === candidate.key) return false;
    const otherStart = minuteIndex(other.date, other.time);
    return start < otherStart + other.durationMinutes && otherStart < end;
  });
}
export function suggestTime(candidate: Occurrence, others: Occurrence[]): string | null {
  if (candidate.time === null) return null;
  const start = timeMinute(candidate.time);
  for (let minute = start; minute + candidate.durationMinutes <= 1440; minute += 1) {
    const time = timeAtMinute(minute);
    if (!conflicts({ ...candidate, time }, others).length) return time;
  }
  return null;
}
