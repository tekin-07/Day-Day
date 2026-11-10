import { db, recordPersistenceAttempt } from "@gungun/data";
import { useEffect, useRef } from "react";
import { tr } from "./i18n/tr";

export function useFirstSavePersistence(
  savedAt: number | undefined,
  notify: (message: string) => void,
) {
  const requested = useRef(false);
  useEffect(() => {
    if (!savedAt || requested.current) return;
    requested.current = true;
    const request = async () => {
      const meta = await db.meta.get("main");
      if (meta?.persistenceAttempted || !(await db.settings.get("main"))) return;
      await recordPersistenceAttempt();
      if (typeof navigator.storage?.persist !== "function") {
        notify(tr.storageUnknown);
        return;
      }
      const granted = await navigator.storage.persist();
      if (!granted) notify(tr.storageDeclined);
    };
    void request().catch(() => notify(tr.error));
  }, [savedAt, notify]);
}
