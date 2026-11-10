import "fake-indexeddb/auto";
import { afterEach, expect, it } from "vitest";
import fixture from "../fixtures/schema-1.json";
import {
  db,
  defaults,
  exportBackup,
  loadSettings,
  previewBackup,
  restoreBackup,
  saveEvent,
  saveSettings,
} from "./index";

const password = "long-password";
afterEach(async () => {
  await db.delete({ disableAutoOpen: false });
});
function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
async function encrypt(payload: unknown, schemaVersion = 1): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const header = {
    formatVersion: 1,
    schemaVersion,
    kdf: "PBKDF2-SHA256",
    iterations: 600000,
    cipher: "AES-256-GCM",
    salt: base64(salt),
    iv: base64(iv),
    exportedAt: 1704067200000,
    mediaCount: 0,
  };
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: new TextEncoder().encode(JSON.stringify(header)),
      tagLength: 128,
    },
    key,
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  return JSON.stringify({ header, ciphertext: base64(new Uint8Array(ciphertext)) });
}
it("imports supported schema-1 encrypted fixtures in memory and creates empty event stores", async () => {
  await saveEvent({
    title: "Demo",
    startDate: "2026-11-07",
    time: null,
    durationMinutes: 0,
    frequency: "once",
    weekdays: [],
    note: "",
    category: "",
  });
  const old = await encrypt(fixture);
  const preview = await previewBackup(old, password);
  expect(preview.count).toBe(1);
  expect(await db.events.count()).toBe(1);
  await restoreBackup(preview);
  expect(await db.events.count()).toBe(0);
  expect(await db.completions.count()).toBe(0);
  expect((await loadSettings()).theme).toBe("paper");
});
it("validates singleton/audit times/unknown payload fields and never changes data", async () => {
  await saveSettings({ theme: "cool" });
  for (const payload of [
    { schemaVersion: 1, settings: [defaults, defaults] },
    { schemaVersion: 1, settings: [{ ...defaults, updatedAt: -1 }] },
    { schemaVersion: 1, settings: [], extra: true },
  ]) {
    const text = await encrypt(payload);
    await expect(previewBackup(text, password)).rejects.toThrow("INVALID_BACKUP");
  }
  expect((await loadSettings()).theme).toBe("cool");
});
it("rejects orphan completions even inside authenticated schema-2 backups", async () => {
  const text = await encrypt(
    {
      schemaVersion: 2,
      settings: [],
      events: [],
      completions: [
        {
          id: "01ARZ3NDEKTSV4RRFFQ69G5FAA",
          eventId: "01ARZ3NDEKTSV4RRFFQ69G5FAB",
          date: "2026-11-07",
          time: null,
          title: "Demo",
          completedAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    },
    2,
  );
  await expect(previewBackup(text, password)).rejects.toThrow("INVALID_BACKUP");
  expect(await db.meta.count()).toBe(0);
});
it("bounds KDF work, rejects unsupported protocols and noncanonical base64 before decryption", async () => {
  const text = await exportBackup(password);
  for (const change of [
    { iterations: 2000001 },
    { formatVersion: 2 },
    { schemaVersion: 3 },
    { salt: "AAAAAAAAAAAAAAAAAAAAAB==" },
    { mediaCount: 1 },
  ]) {
    const file = JSON.parse(text);
    Object.assign(file.header, change);
    await expect(previewBackup(JSON.stringify(file), password)).rejects.toThrow("INVALID_BACKUP");
  }
  await expect(exportBackup("short")).rejects.toThrow("PASSWORD_TOO_SHORT");
});
it("rejects changed preview payload before overwrite", async () => {
  await saveSettings({ theme: "cool" });
  const preview = await previewBackup(await exportBackup(password), password);
  Object.assign(preview, {
    payload: {
      schemaVersion: 2,
      settings: [{ ...defaults, theme: "unknown" }],
      events: [],
      completions: [],
    },
  });
  await expect(restoreBackup(preview)).rejects.toThrow("INVALID_BACKUP");
  expect((await loadSettings()).theme).toBe("cool");
});
