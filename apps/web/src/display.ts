import { tr } from "./i18n/tr";

export function formatDate(date: string, short = false) {
  // This conversion is presentation only; calendar rules belong to core/time.
  return new Intl.DateTimeFormat(tr.locale, {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: short ? "short" : "long",
    ...(short ? {} : { weekday: "long" }),
  }).format(Date.parse(`${date}T12:00:00+03:00`));
}
export function formatInstant(instant: number) {
  return new Intl.DateTimeFormat(tr.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(instant);
}
