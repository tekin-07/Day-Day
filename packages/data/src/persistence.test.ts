import "fake-indexeddb/auto";
import { afterEach, expect, it } from "vitest";
import { db, recordPersistenceAttempt } from "./index";

afterEach(async () => {
  await db.delete({ disableAutoOpen: false });
});
it("records the device persistence attempt transactionally without claiming permission", async () => {
  await recordPersistenceAttempt();
  expect(await db.meta.get("main")).toMatchObject({
    schemaVersion: 2,
    persistenceAttempted: true,
    revision: 1,
  });
  expect(await db.settings.count()).toBe(0);
  await recordPersistenceAttempt();
  expect((await db.meta.get("main"))?.persistenceAttempted).toBe(true);
});
