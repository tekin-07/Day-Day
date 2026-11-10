import "fake-indexeddb/auto";
import { type EventDraft, occurrences } from "@gungun/core";
import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  db,
  defaults,
  deleteEvent,
  exportBackup,
  loadSettings,
  previewBackup,
  recordBackup,
  restoreBackup,
  restoreEvent,
  saveEvent,
  saveSettings,
  setOccurrenceCompleted,
} from "./index";

const draft: EventDraft = {
  title: "Fabricated walk",
  startDate: "2026-11-07",
  time: "09:00",
  durationMinutes: 30,
  frequency: "daily",
  weekdays: [],
  note: "",
  category: "",
};
afterEach(async () => {
  vi.useRealTimers();
  await db.delete({ disableAutoOpen: false });
});
describe("transactional user records", () => {
  it("keeps defaults in memory and merges concurrent preference patches", async () => {
    expect(await loadSettings()).toEqual(defaults);
    expect(await db.settings.count()).toBe(0);
    await Promise.all([saveSettings({ theme: "cool" }), saveSettings({ appearance: "dark" })]);
    expect(await loadSettings()).toMatchObject({ theme: "cool", appearance: "dark" });
    expect((await db.meta.get("main"))?.revision).toBe(2);
  });
  it("preserves earlier schedule and completion snapshots on edit and deletion", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1794042000000);
    await saveEvent(draft);
    const first = (await db.events.toArray())[0];
    if (!first) throw Error("fixture");
    const occ = occurrences([first], draft.startDate, draft.startDate)[0];
    if (!occ) throw Error("fixture");
    await Promise.all([setOccurrenceCompleted(occ, true), setOccurrenceCompleted(occ, true)]);
    expect(await db.completions.count()).toBe(1);
    vi.spyOn(Date, "now").mockReturnValue(1794128400000);
    await saveEvent({ ...draft, time: "12:00" }, first.id);
    const edited = await db.events.get(first.id);
    expect(edited && occurrences([edited], "2026-11-07", "2026-11-08").map((x) => x.time)).toEqual([
      "09:00",
      "12:00",
    ]);
    await deleteEvent(first.id);
    expect((await db.completions.toArray())[0]).toMatchObject({
      time: "09:00",
      title: draft.title,
    });
    await restoreEvent(first.id);
    expect((await db.events.get(first.id))?.deletedAt).toBeUndefined();
  });
  it("rejects untrusted drafts and preference fields without writes", async () => {
    await expect(saveEvent({ ...draft, title: "" })).rejects.toThrow("VALIDATION");
    await expect(saveSettings(JSON.parse('{"theme":"cool","unexpected":1}'))).rejects.toThrow(
      "VALIDATION",
    );
    expect(await db.events.count()).toBe(0);
    expect(await db.meta.count()).toBe(0);
  });
});
describe("authenticated atomic backup", () => {
  it("roundtrips deleted history, excludes metadata, and rejects stale preview", async () => {
    await saveEvent(draft);
    const event = (await db.events.toArray())[0];
    if (!event) throw Error("fixture");
    await deleteEvent(event.id);
    const text = await exportBackup("long-password");
    const envelope = JSON.parse(text);
    expect(Object.keys(envelope.header)).toEqual([
      "formatVersion",
      "schemaVersion",
      "kdf",
      "iterations",
      "cipher",
      "salt",
      "iv",
      "exportedAt",
      "mediaCount",
    ]);
    expect(envelope.header.iterations).toBe(600000);
    const preview = await previewBackup(text, "long-password");
    expect(preview.count).toBe(1);
    await saveSettings({ theme: "balanced" });
    await expect(restoreBackup(preview)).rejects.toThrow("STALE_PREVIEW");
    const fresh = await previewBackup(text, "long-password");
    const local = await db.meta.get("main");
    await restoreBackup(fresh);
    expect((await db.meta.get("main"))?.installationId).toBe(local?.installationId);
    expect((await db.events.get(event.id))?.deletedAt).toBeDefined();
  });
  it("rejects wrong password, modified authentication fields and oversized/unknown files without mutation", async () => {
    await saveSettings({ theme: "cool" });
    const text = await exportBackup("long-password");
    const before = await db.meta.get("main");
    await expect(previewBackup(text, "wrong-password")).rejects.toThrow("DECRYPT_FAILED");
    const envelope = JSON.parse(text);
    envelope.header.exportedAt += 1;
    await expect(previewBackup(JSON.stringify(envelope), "long-password")).rejects.toThrow(
      "DECRYPT_FAILED",
    );
    envelope.extra = true;
    await expect(previewBackup(JSON.stringify(envelope), "long-password")).rejects.toThrow(
      "INVALID_BACKUP",
    );
    await expect(previewBackup("x".repeat(5 * 1024 * 1024 + 1), "long-password")).rejects.toThrow(
      "FILE_TOO_LARGE",
    );
    expect(await db.meta.get("main")).toEqual(before);
    expect((await loadSettings()).theme).toBe("cool");
  });
  it("rolls back settings clears and revision when restore insertion fails", async () => {
    await saveSettings({ theme: "paper" });
    const text = await exportBackup("long-password");
    await saveSettings({ theme: "cool" });
    const preview = await previewBackup(text, "long-password");
    const before = await db.meta.get("main");
    const hook = () => {
      throw Error("INJECTED_FAILURE");
    };
    db.settings.hook("creating", hook);
    await expect(restoreBackup(preview)).rejects.toThrow("INJECTED_FAILURE");
    db.settings.hook("creating").unsubscribe(hook);
    expect((await loadSettings()).theme).toBe("cool");
    expect(await db.meta.get("main")).toEqual(before);
  });
  it("exports recovery without mutation and records backup only on explicit completion", async () => {
    const text = await exportBackup("long-password");
    expect(text.length).toBeGreaterThan(100);
    expect(await db.settings.count()).toBe(0);
    expect(await db.meta.count()).toBe(0);
    await recordBackup();
    expect((await loadSettings()).lastBackupAt).toBeTypeOf("number");
  });
  it("upgrades a real schema-1 IndexedDB fixture without discarding settings", async () => {
    const old = new Dexie("gungun");
    old.version(1).stores({ settings: "id", meta: "id" });
    await old.table("settings").put({ ...defaults, theme: "cool" });
    await old.table("meta").put({
      id: "main",
      schemaVersion: 1,
      installationId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      revision: 4,
      persistenceAttempted: true,
    });
    old.close();
    await db.open();
    expect((await loadSettings()).theme).toBe("cool");
    expect((await db.meta.get("main"))?.schemaVersion).toBe(2);
    expect(await db.events.count()).toBe(0);
  });
});
