import type { Completion, EventRecord, Settings } from "@gungun/core";
import Dexie, { type Table } from "dexie";
import { ulid } from "ulid";
export interface Meta {
  id: "main";
  schemaVersion: 2;
  installationId: string;
  revision: number;
  persistenceAttempted: boolean;
}
class Database extends Dexie {
  settings!: Table<Settings, string>;
  events!: Table<EventRecord, string>;
  completions!: Table<Completion, string>;
  meta!: Table<Meta, string>;
  constructor() {
    super("gungun");
    this.version(1).stores({ settings: "id", meta: "id" });
    this.version(2)
      .stores({
        settings: "id",
        meta: "id",
        events: "id, startDate, deletedAt",
        completions: "id, &[eventId+date], date, deletedAt",
      })
      .upgrade(async (tx) => {
        await tx.table("meta").toCollection().modify({ schemaVersion: 2 });
      });
  }
}
export const db = new Database();
export const defaults: Settings = {
  id: "main",
  theme: "paper",
  appearance: "system",
  timeZone: "Europe/Istanbul",
  createdAt: 0,
  updatedAt: 0,
  lastBackupAt: null,
};
export async function revision(): Promise<number> {
  return (await db.meta.get("main"))?.revision ?? 0;
}
export async function bumpRevision(): Promise<void> {
  const current = await db.meta.get("main");
  const meta: Meta = current ?? {
    id: "main",
    schemaVersion: 2,
    installationId: ulid(),
    revision: 0,
    persistenceAttempted: false,
  };
  await db.meta.put({ ...meta, revision: meta.revision + 1 });
}
export async function write(action: () => Promise<void>): Promise<void> {
  // ponytail: one write lock; split tables only if measured local workloads need it.
  await db.transaction("rw", db.settings, db.events, db.completions, db.meta, async () => {
    await action();
    await bumpRevision();
  });
}
export async function recordPersistenceAttempt(): Promise<void> {
  await db.transaction("rw", db.meta, async () => {
    await bumpRevision();
    await db.meta.update("main", { persistenceAttempted: true });
  });
}
