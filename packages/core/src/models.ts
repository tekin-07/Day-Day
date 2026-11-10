export type Theme = "cool" | "paper" | "balanced";
export type Appearance = "light" | "dark" | "system";
export type Frequency = "once" | "daily" | "weekly" | "monthly";
export interface EventDraft {
  title: string;
  startDate: string;
  time: string | null;
  durationMinutes: number;
  frequency: Frequency;
  weekdays: number[];
  note: string;
  category: string;
}
export interface EventVersion extends EventDraft {
  effectiveFrom: string;
}
export interface EventRecord extends EventDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  versions: EventVersion[];
}
export interface Occurrence {
  key: string;
  eventId: string;
  date: string;
  time: string | null;
  title: string;
  durationMinutes: number;
  note: string;
  category: string;
}
export interface Completion {
  id: string;
  eventId: string;
  date: string;
  time: string | null;
  title: string;
  completedAt: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
export interface Settings {
  id: "main";
  theme: Theme;
  appearance: Appearance;
  timeZone: "Europe/Istanbul";
  createdAt: number;
  updatedAt: number;
  lastBackupAt: number | null;
  onboarded?: boolean;
  routineNote?: string;
}
