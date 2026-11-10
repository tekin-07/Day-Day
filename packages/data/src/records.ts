import {
  type EventDraft,
  type EventRecord,
  localDate,
  type Occurrence,
  occurrences,
  type Settings,
} from "@gungun/core";
import { ulid } from "ulid";
import { db, defaults, write } from "./db";
import {
  draftSchema,
  eventSchema,
  idSchema,
  occurrenceSchema,
  patchSchema,
  settingsSchema,
  validated,
} from "./validation";
export async function loadSettings(): Promise<Settings> {
  const row = await db.settings.get("main");
  return row ? validated(settingsSchema, row) : { ...defaults };
}
export async function saveSettings(
  patch: Partial<Pick<Settings, "theme" | "appearance" | "onboarded" | "routineNote">>,
): Promise<void> {
  const value = validated(patchSchema, patch);
  await write(async () => {
    const saved = await db.settings.get("main");
    const current = saved ? validated(settingsSchema, saved) : defaults;
    const now = Date.now();
    await db.settings.put(
      validated(settingsSchema, {
        ...current,
        ...value,
        createdAt: saved?.createdAt ?? now,
        updatedAt: Math.max(now, current.updatedAt),
      }),
    );
  });
}
function eventVersion(draft: EventDraft, effectiveFrom: string) {
  return { ...draft, effectiveFrom };
}
export async function saveEvent(draft: EventDraft, id?: string): Promise<void> {
  const value = validated(draftSchema, draft);
  if (id !== undefined) validated(idSchema, id);
  await write(async () => {
    const existing = id ? await db.events.get(id) : undefined;
    if (id && (!existing || existing.deletedAt !== undefined)) throw Error("EVENT_NOT_FOUND");
    const now = Date.now();
    const effectiveFrom = existing ? [localDate(now), value.startDate].sort()[1] : value.startDate;
    const versions = (existing?.versions ?? []).filter(
      (version) => version.effectiveFrom < effectiveFrom,
    );
    versions.push(eventVersion(value, effectiveFrom));
    const record: EventRecord = {
      ...value,
      id: existing?.id ?? ulid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: Math.max(now, existing?.updatedAt ?? 0),
      versions,
    };
    await db.events.put(validated(eventSchema, record));
  });
}
async function setDeleted(id: string, deleted: boolean): Promise<void> {
  validated(idSchema, id);
  await write(async () => {
    const event = await db.events.get(id);
    if (!event) throw Error("EVENT_NOT_FOUND");
    const now = Math.max(Date.now(), event.updatedAt);
    if (deleted) event.deletedAt = now;
    else delete event.deletedAt;
    await db.events.put({ ...event, updatedAt: now });
  });
}
export async function deleteEvent(id: string): Promise<void> {
  await setDeleted(id, true);
}
export async function restoreEvent(id: string): Promise<void> {
  await setDeleted(id, false);
}
export async function setOccurrenceCompleted(occ: Occurrence, complete: boolean): Promise<void> {
  const value = validated(occurrenceSchema, occ);
  await write(async () => {
    const event = await db.events.get(value.eventId);
    if (!event) throw Error("EVENT_NOT_FOUND");
    const existing = await db.completions
      .where("[eventId+date]")
      .equals([value.eventId, value.date])
      .first();
    if (!complete && !existing) return;
    if (complete && !existing) {
      const expected = occurrences([event], value.date, value.date)[0];
      if (
        !expected ||
        Object.keys(expected).some((key) => Reflect.get(expected, key) !== Reflect.get(value, key))
      )
        throw Error("INVALID_OCCURRENCE");
    }
    const now = Math.max(Date.now(), existing?.updatedAt ?? 0);
    if (existing) {
      if (complete) {
        delete existing.deletedAt;
      } else existing.deletedAt = now;
      await db.completions.put({ ...existing, updatedAt: now });
    } else if (complete) {
      await db.completions.add({
        id: ulid(),
        eventId: value.eventId,
        date: value.date,
        time: value.time,
        title: value.title,
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  });
}
export async function recordBackup(): Promise<void> {
  await write(async () => {
    const saved = await db.settings.get("main");
    const current = saved ? validated(settingsSchema, saved) : defaults;
    const now = Date.now();
    await db.settings.put({
      ...current,
      createdAt: saved?.createdAt ?? now,
      updatedAt: Math.max(now, current.updatedAt),
      lastBackupAt: now,
    });
  });
}
