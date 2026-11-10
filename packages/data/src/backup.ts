import { z } from "zod";
import { decryptPayload, encryptPayload } from "./crypto";
import { bumpRevision, db, revision } from "./db";
import { type Payload, validatePayload } from "./validation";
export interface RestorePreview {
  payload: Payload;
  revision: number;
  count: number;
}
export async function exportBackup(password: string): Promise<string> {
  const payload = await db.transaction("r", db.settings, db.events, db.completions, async () =>
    validatePayload({
      schemaVersion: 2,
      settings: await db.settings.toArray(),
      events: await db.events.toArray(),
      completions: await db.completions.toArray(),
    }),
  );
  return encryptPayload(payload, password);
}
export async function previewBackup(text: string, password: string): Promise<RestorePreview> {
  const payload = validatePayload(await decryptPayload(text, password));
  return {
    payload,
    revision: await revision(),
    count: payload.settings.length + payload.events.length + payload.completions.length,
  };
}
export async function restoreBackup(preview: RestorePreview): Promise<void> {
  await db.transaction("rw", db.settings, db.events, db.completions, db.meta, async () => {
    const payload = validatePayload(preview.payload);
    const checked = z.number().int().nonnegative().safeParse(preview.revision);
    if (!checked.success) throw Error("INVALID_BACKUP");
    if ((await revision()) !== checked.data) throw Error("STALE_PREVIEW");
    await db.settings.clear();
    await db.events.clear();
    await db.completions.clear();
    await db.settings.bulkAdd(payload.settings);
    await db.events.bulkAdd(payload.events);
    await db.completions.bulkAdd(payload.completions);
    await bumpRevision();
  });
}
