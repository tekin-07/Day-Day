import { describe, expect, it } from "vitest";
import { backupFileName, validateExportPassword } from "./backup-files";

describe("backup interaction boundaries", () => {
  it("requires matching nontrivial passwords before preparing a backup", () => {
    expect(validateExportPassword("short", "short")).toBe(false);
    expect(validateExportPassword("a-long-password", "different")).toBe(false);
    expect(validateExportPassword("a-long-password", "a-long-password")).toBe(true);
  });
  it("uses a local date and the encrypted backup extension", () => {
    expect(backupFileName("2026-11-07")).toBe("gungun-2026-11-07.gungun");
  });
});
