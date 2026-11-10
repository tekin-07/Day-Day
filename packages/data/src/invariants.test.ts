import "fake-indexeddb/auto";
import { type EventDraft, occurrences } from "@gungun/core";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  db,
  deleteEvent,
  exportBackup,
  loadSettings,
  previewBackup,
  restoreBackup,
  restoreEvent,
  saveEvent,
  saveSettings,
  setOccurrenceCompleted,
} from "./index";

const draft: EventDraft = {
  title: "Demo event",
  startDate: "2026-11-07",
  time: "10:00",
  durationMinutes: 30,
  frequency: "daily",
  weekdays: [],
  note: "",
  category: "",
};
afterEach(async () => {
  vi.restoreAllMocks();
  await db.delete({ disableAutoOpen: false });
});
it("rejects invalid date/time/recurrence/durations without advancing revision", async () => {
  for (const patch of [
    { startDate: "2026-02-30" },
    { time: "24:00" },
    { durationMinutes: 0 },
    { durationMinutes: 1.5 },
    { durationMinutes: Infinity },
    { frequency: "weekly", weekdays: [] },
    { frequency: "weekly", weekdays: [1, 1] },
    { weekdays: [1] },
    { extra: true },
  ]) {
    await expect(saveEvent({ ...draft, ...patch } as EventDraft)).rejects.toThrow("VALIDATION");
  }
  expect(await db.meta.count()).toBe(0);
});
it("retains unique snapshots through complete/reopen and same-day series edits", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1794042000000);
  await saveEvent(draft);
  const event = (await db.events.toArray())[0];
  const occ = occurrences([event], draft.startDate, draft.startDate)[0];
  await setOccurrenceCompleted(occ, true);
  await saveEvent({ ...draft, title: "Changed", time: "11:00" }, event.id);
  const current = await db.events.get(event.id);
  if (!current) throw Error("fixture");
  const latest = occurrences([current], draft.startDate, draft.startDate)[0];
  await setOccurrenceCompleted(latest, false);
  expect((await db.completions.toArray())[0].deletedAt).toBeDefined();
  await setOccurrenceCompleted(latest, true);
  expect(await db.completions.count()).toBe(1);
  expect((await db.completions.toArray())[0]).toMatchObject({ title: "Demo event", time: "10:00" });
  expect((await db.completions.toArray())[0].deletedAt).toBeUndefined();
});
it("rejects forged completion snapshots without writing history", async () => {
  await saveEvent(draft);
  const event = (await db.events.toArray())[0];
  const occ = occurrences([event], draft.startDate, draft.startDate)[0];
  const before = await db.meta.get("main");
  await expect(setOccurrenceCompleted({ ...occ, title: "Forged" }, true)).rejects.toThrow(
    "INVALID_OCCURRENCE",
  );
  expect(await db.completions.count()).toBe(0);
  expect(await db.meta.get("main")).toEqual(before);
});
it("keeps current schedule start stable after deletion/undo on later local dates", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1794042000000);
  await saveEvent(draft);
  const event = (await db.events.toArray())[0];
  vi.spyOn(Date, "now").mockReturnValue(1794128400000);
  await deleteEvent(event.id);
  await restoreEvent(event.id);
  const restored = await db.events.get(event.id);
  if (!restored) throw Error("fixture");
  expect(occurrences([restored], draft.startDate, draft.startDate)).toHaveLength(1);
});
it("serializes preference changes from a second IndexedDB connection", async () => {
  await saveSettings({ theme: "paper" });
  const peer = new Dexie("gungun");
  await peer.open();
  try {
    await Promise.all([
      saveSettings({ theme: "cool" }),
      peer.transaction("rw", peer.table("settings"), peer.table("meta"), async () => {
        const row = await peer.table("settings").get("main");
        await peer.table("settings").put({ ...row, appearance: "dark" });
        const meta = await peer.table("meta").get("main");
        await peer.table("meta").put({ ...meta, revision: meta.revision + 1 });
      }),
    ]);
    expect(await loadSettings()).toMatchObject({ theme: "cool", appearance: "dark" });
  } finally {
    peer.close();
  }
});
it("authenticates every header field and ciphertext without a local mutation", async () => {
  await saveSettings({ theme: "cool" });
  const text = await exportBackup("long-password");
  const original = JSON.parse(text);
  const before = await db.meta.get("main");
  const changes = [
    { formatVersion: 2 },
    { schemaVersion: 1 },
    { kdf: "PBKDF2-SHA512" },
    { iterations: 600001 },
    { cipher: "AES-128-GCM" },
    { salt: btoa("abcdefghijklmnop") },
    { iv: btoa("abcdefghijkl") },
    { exportedAt: original.header.exportedAt + 1 },
    { mediaCount: 1 },
  ];
  for (const change of changes) {
    const file = JSON.parse(text);
    Object.assign(file.header, change);
    await expect(previewBackup(JSON.stringify(file), "long-password")).rejects.toThrow();
  }
  original.ciphertext = (original.ciphertext[0] === "A" ? "B" : "A") + original.ciphertext.slice(1);
  await expect(previewBackup(JSON.stringify(original), "long-password")).rejects.toThrow(
    "DECRYPT_FAILED",
  );
  expect(await db.meta.get("main")).toEqual(before);
});
it("does not write when a valid preview is abandoned", async () => {
  await saveSettings({ theme: "cool" });
  const before = await db.meta.get("main");
  await previewBackup(await exportBackup("long-password"), "long-password");
  expect(await db.meta.get("main")).toEqual(before);
  expect((await loadSettings()).theme).toBe("cool");
});
it("detects a stale preview inside the transaction after a queued concurrent write", async () => {
  await saveSettings({ theme: "paper" });
  const preview = await previewBackup(await exportBackup("long-password"), "long-password");
  const write = saveSettings({ theme: "cool" });
  const restore = restoreBackup(preview);
  await write;
  await expect(restore).rejects.toThrow("STALE_PREVIEW");
  expect((await loadSettings()).theme).toBe("cool");
});
it("retains a legitimate epoch-zero creation timestamp on later preferences and backup recording", async () => {
  vi.spyOn(Date, "now").mockReturnValue(0);
  await saveSettings({ theme: "paper" });
  vi.spyOn(Date, "now").mockReturnValue(1000);
  await saveSettings({ theme: "cool" });
  expect((await loadSettings()).createdAt).toBe(0);
});
