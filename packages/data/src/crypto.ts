import { z } from "zod";
import { instant } from "./validation";

const maxFileBytes = 5 * 1024 * 1024;
const base64Schema = z
  .string()
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
const headerSchema = z.strictObject({
  formatVersion: z.literal(1),
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  kdf: z.literal("PBKDF2-SHA256"),
  iterations: z.number().int().min(600000).max(2000000),
  cipher: z.literal("AES-256-GCM"),
  salt: base64Schema.length(24),
  iv: base64Schema.length(16),
  exportedAt: instant,
  mediaCount: z.literal(0),
});
const envelopeSchema = z.strictObject({
  header: headerSchema,
  ciphertext: base64Schema.min(24).max(maxFileBytes),
});
type Header = z.infer<typeof headerSchema>;
const encoder = new TextEncoder();
export function checkPassword(password: string): void {
  if (typeof password !== "string" || [...password].length < 10) throw Error("PASSWORD_TOO_SHORT");
}
function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}
function unbase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  if (base64(bytes) !== value) throw Error("INVALID_BACKUP");
  return bytes;
}
function canonicalHeader(header: Header): Header {
  const {
    formatVersion,
    schemaVersion,
    kdf,
    iterations,
    cipher,
    salt,
    iv,
    exportedAt,
    mediaCount,
  } = header;
  return {
    formatVersion,
    schemaVersion,
    kdf,
    iterations,
    cipher,
    salt,
    iv,
    exportedAt,
    mediaCount,
  };
}
async function derive(header: Header, password: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: unbase64(header.salt), iterations: header.iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
function boundFile(text: string): void {
  if (text.length > maxFileBytes || encoder.encode(text).byteLength > maxFileBytes)
    throw Error("FILE_TOO_LARGE");
}
export async function encryptPayload(payload: unknown, password: string): Promise<string> {
  checkPassword(password);
  const header: Header = {
    formatVersion: 1,
    schemaVersion: 2,
    kdf: "PBKDF2-SHA256",
    iterations: 600000,
    cipher: "AES-256-GCM",
    salt: base64(crypto.getRandomValues(new Uint8Array(16))),
    iv: base64(crypto.getRandomValues(new Uint8Array(12))),
    exportedAt: Date.now(),
    mediaCount: 0,
  };
  const key = await derive(header, password);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: unbase64(header.iv),
      additionalData: encoder.encode(JSON.stringify(header)),
      tagLength: 128,
    },
    key,
    encoder.encode(JSON.stringify(payload)),
  );
  const text = JSON.stringify({ header, ciphertext: base64(new Uint8Array(ciphertext)) });
  boundFile(text);
  return text;
}
export async function decryptPayload(text: string, password: string): Promise<unknown> {
  checkPassword(password);
  boundFile(text);
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw Error("INVALID_BACKUP");
  }
  const parsed = envelopeSchema.safeParse(input);
  if (!parsed.success) throw Error("INVALID_BACKUP");
  const header = canonicalHeader(parsed.data.header);
  const salt = unbase64(header.salt);
  const iv = unbase64(header.iv);
  const ciphertext = unbase64(parsed.data.ciphertext);
  if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16)
    throw Error("INVALID_BACKUP");
  const key = await derive(header, password);
  let bytes: ArrayBuffer;
  try {
    bytes = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: encoder.encode(JSON.stringify(header)),
        tagLength: 128,
      },
      key,
      ciphertext,
    );
  } catch {
    throw Error("DECRYPT_FAILED");
  }
  try {
    const payload: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (
      typeof payload !== "object" ||
      payload === null ||
      Reflect.get(payload, "schemaVersion") !== header.schemaVersion
    )
      throw Error("INVALID_BACKUP");
    return payload;
  } catch {
    throw Error("INVALID_BACKUP");
  }
}
