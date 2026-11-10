import { Temporal } from "@js-temporal/polyfill";

const zone = "Europe/Istanbul";
export function localDate(now: number): string {
  return Temporal.Instant.fromEpochMilliseconds(now)
    .toZonedDateTimeISO(zone)
    .toPlainDate()
    .toString();
}
export function addDays(date: string, days: number): string {
  return Temporal.PlainDate.from(date).add({ days }).toString();
}
export function weekDates(date: string): string[] {
  const start = addDays(date, 1 - Temporal.PlainDate.from(date).dayOfWeek);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}
export function monthDates(date: string): string[] {
  const start = Temporal.PlainDate.from(date).with({ day: 1 });
  return Array.from({ length: start.daysInMonth }, (_, index) =>
    start.add({ days: index }).toString(),
  );
}
export function isLocalDate(value: string): boolean {
  try {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Temporal.PlainDate.from(value, { overflow: "reject" }).toString() === value
    );
  } catch {
    return false;
  }
}
export function isLocalTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function repeatsOn(
  start: string,
  date: string,
  frequency: string,
  weekdays: number[],
): boolean {
  if (date < start) return false;
  if (frequency === "once") return date === start;
  if (frequency === "daily") return true;
  const day = Temporal.PlainDate.from(date);
  if (frequency === "weekly") return weekdays.includes(day.dayOfWeek);
  return day.day === Math.min(Temporal.PlainDate.from(start).day, day.daysInMonth);
}
export function minuteIndex(date: string, time: string): number {
  return (
    Temporal.PlainDate.from(date).toZonedDateTime({ timeZone: zone, plainTime: time })
      .epochMilliseconds / 60000
  );
}
export function timeAtMinute(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
export function timeMinute(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
}
