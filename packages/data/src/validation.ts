import {
  type Completion,
  type EventDraft,
  type EventRecord,
  isLocalDate,
  isLocalTime,
  type Settings,
} from "@gungun/core";
import { z } from "zod";
export const instant = z.number().int().nonnegative().max(8640000000000000);
export const idSchema = z.string().regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
const date = z.string().refine(isLocalDate);
const time = z.string().refine(isLocalTime).nullable();
const title = z.string().trim().min(1).max(200);
const draftShape = {
  title,
  startDate: date,
  time,
  durationMinutes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  frequency: z.enum(["once", "daily", "weekly", "monthly"]),
  weekdays: z.array(z.number().int().min(1).max(7)).max(7),
  note: z.string().max(10000),
  category: z.string().max(100),
};
function validDraft(value: EventDraft): boolean {
  return (
    (value.time === null || value.durationMinutes > 0) &&
    (value.frequency === "weekly"
      ? value.weekdays.length > 0 && new Set(value.weekdays).size === value.weekdays.length
      : value.weekdays.length === 0)
  );
}
export const draftSchema = z.strictObject(draftShape).refine(validDraft);
const versionSchema = z
  .strictObject({ ...draftShape, effectiveFrom: date })
  .refine(validDraft)
  .refine((v) => v.effectiveFrom >= v.startDate);
const audit = { createdAt: instant, updatedAt: instant, deletedAt: instant.optional() };
function validAudit(value: { createdAt: number; updatedAt: number; deletedAt?: number }): boolean {
  return (
    value.updatedAt >= value.createdAt &&
    (value.deletedAt === undefined ||
      (value.deletedAt >= value.createdAt && value.deletedAt <= value.updatedAt))
  );
}
export const eventSchema: z.ZodType<EventRecord> = z
  .strictObject({ ...draftShape, id: idSchema, ...audit, versions: z.array(versionSchema).min(1) })
  .refine(validDraft)
  .refine(validAudit)
  .refine((event) => {
    if (
      event.versions.some(
        (version, index) =>
          index > 0 && version.effectiveFrom <= event.versions[index - 1].effectiveFrom,
      )
    )
      return false;
    const current = event.versions[event.versions.length - 1];
    return (
      current !== undefined &&
      Object.keys(draftShape).every(
        (key) =>
          JSON.stringify(Reflect.get(current, key)) === JSON.stringify(Reflect.get(event, key)),
      )
    );
  });
export const completionSchema: z.ZodType<Completion> = z
  .strictObject({
    id: idSchema,
    eventId: idSchema,
    date,
    time,
    title,
    completedAt: instant,
    ...audit,
  })
  .refine(validAudit)
  .refine((value) => value.completedAt >= value.createdAt && value.completedAt <= value.updatedAt);
const settingsShape = {
  id: z.literal("main"),
  theme: z.enum(["cool", "paper", "balanced"]),
  appearance: z.enum(["light", "dark", "system"]),
  timeZone: z.literal("Europe/Istanbul"),
  createdAt: instant,
  updatedAt: instant,
  lastBackupAt: instant.nullable(),
};
export const settingsV1 = z.strictObject(settingsShape).refine(validAudit);
export const settingsSchema: z.ZodType<Settings> = z
  .strictObject({
    ...settingsShape,
    onboarded: z.boolean().optional(),
    routineNote: z.string().max(10000).optional(),
  })
  .refine(validAudit);
export const patchSchema = z.strictObject({
  theme: settingsShape.theme.optional(),
  appearance: settingsShape.appearance.optional(),
  onboarded: z.boolean().optional(),
  routineNote: z.string().max(10000).optional(),
});
export const occurrenceSchema = z
  .strictObject({
    key: z.string(),
    eventId: idSchema,
    date,
    time,
    title,
    durationMinutes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    note: z.string().max(10000),
    category: z.string().max(100),
  })
  .refine((value) => value.key === `${value.eventId}/${value.date}`);
export interface Payload {
  schemaVersion: 2;
  settings: Settings[];
  events: EventRecord[];
  completions: Completion[];
}
const payloadV1 = z.strictObject({
  schemaVersion: z.literal(1),
  settings: z.array(settingsV1).max(1),
});
const payloadV2 = z.strictObject({
  schemaVersion: z.literal(2),
  settings: z.array(settingsSchema).max(1),
  events: z.array(eventSchema),
  completions: z.array(completionSchema),
});
function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}
export function validatePayload(input: unknown): Payload {
  const parsed = z.union([payloadV1, payloadV2]).safeParse(input);
  if (!parsed.success) throw Error("INVALID_BACKUP");
  const payload: Payload =
    parsed.data.schemaVersion === 1
      ? { schemaVersion: 2, settings: parsed.data.settings, events: [], completions: [] }
      : parsed.data;
  const ids = new Set(payload.events.map((event) => event.id));
  if (
    !unique(payload.events.map((event) => event.id)) ||
    !unique(payload.completions.map((item) => item.id)) ||
    !unique(payload.completions.map((item) => `${item.eventId}/${item.date}`)) ||
    payload.completions.some((item) => !ids.has(item.eventId))
  )
    throw Error("INVALID_BACKUP");
  return payload;
}
export function validated<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw Error("VALIDATION");
  return result.data;
}
