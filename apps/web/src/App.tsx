import type { Settings } from "@gungun/core";
import { db, loadSettings } from "@gungun/data";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "./components/Modal";
import { Onboarding } from "./components/Onboarding";
import { Navigation, Screens } from "./components/Screens";
import { tr } from "./i18n/tr";
import { usePwa } from "./pwa";
import { useFirstSavePersistence } from "./storage";

export function App() {
  const snapshot = useLiveQuery(async () => {
    try {
      const [settings, events, completions] = await Promise.all([
        loadSettings(),
        db.events.toArray(),
        db.completions.toArray(),
      ]);
      return { settings, events, completions };
    } catch {
      return null;
    }
  });
  const [dirty, setDirty] = useState(false);
  const changeDirty = useCallback((value: boolean) => setDirty(value), []);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const bypass = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !bypass.current && currentLocation.key !== nextLocation.key,
  );
  const pwa = usePwa(dirty);
  useEffect(() => {
    bypass.current = false;
    void location.key;
  }, [location.key]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);
  useTheme(snapshot?.settings);
  useFirstSavePersistence(snapshot?.settings.createdAt, setMessage);
  const saved = (notice: string) => {
    bypass.current = true;
    setDirty(false);
    setMessage(notice);
    void navigate("/today");
  };
  if (snapshot === undefined)
    return (
      <main className="app-shell">
        <p role="status">{tr.loading}</p>
      </main>
    );
  if (snapshot === null)
    return (
      <main className="app-shell">
        <h1>{tr.app}</h1>
        <p role="alert">{tr.loadError}</p>
        <button type="button" onClick={() => window.location.reload()}>
          {tr.retry}
        </button>
      </main>
    );
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        {tr.skip}
      </a>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span>{tr.app}</span>
        <span className="brand-note">{tr.tagline}</span>
      </div>
      {pwa.updateReady && (
        <aside className="update">
          <p>{tr.update}</p>
          <button
            type="button"
            disabled={dirty}
            onClick={() => {
              void pwa.applyUpdate().catch(() => setMessage(tr.error));
            }}
          >
            {tr.applyUpdate}
          </button>
          {dirty && <p>{tr.dirtyUpdate}</p>}
          {pwa.updateBlocked && <p role="status">{tr.updateBlocked}</p>}
        </aside>
      )}
      <p className={`feedback ${message ? "visible" : ""}`} role="status" aria-live="polite">
        {message}
      </p>
      <main id="main">
        {!snapshot.settings.onboarded ? (
          <Onboarding dirty={changeDirty} />
        ) : (
          <Screens snapshot={snapshot} dirty={changeDirty} notify={setMessage} saved={saved} />
        )}
      </main>
      <Navigation
        current={location.pathname}
        go={(path) => {
          void navigate(path);
        }}
      />
      {blocker.state === "blocked" && (
        <Modal title={tr.discardTitle} description={tr.discardText} close={() => blocker.reset()}>
          <div className="stack">
            <button type="button" className="primary" onClick={() => blocker.reset()}>
              {tr.stay}
            </button>
            <button
              type="button"
              onClick={() => {
                setDirty(false);
                blocker.proceed();
              }}
            >
              {tr.discard}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function useTheme(settings?: Settings) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = settings?.theme ?? "paper";
      document.documentElement.dataset.appearance =
        settings?.appearance === "system" || !settings
          ? media.matches
            ? "dark"
            : "light"
          : settings.appearance;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings?.theme, settings?.appearance, settings]);
}
