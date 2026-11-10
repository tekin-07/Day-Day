import { useEffect, useRef, useState } from "react";

export function usePwa(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [updateBlocked, setUpdateBlocked] = useState(false);
  const requested = useRef(false);
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const message = (event: MessageEvent) => {
      if (event.data?.type === "UPDATE_CHECK")
        event.source?.postMessage({
          type: "CLIENT_STATE",
          dirty: dirtyRef.current,
          version: document.querySelector<HTMLMetaElement>('meta[name="gungun-build"]')?.content,
          requestId: event.data.requestId,
        });
      if (event.data?.type === "UPDATE_BLOCKED") {
        setUpdateBlocked(true);
        requested.current = false;
      }
    };
    const changed = () => {
      if (requested.current && !dirtyRef.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("message", message);
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((value) => {
        registration.current = value;
        setUpdateReady(Boolean(value.waiting));
        value.addEventListener("updatefound", () => {
          value.installing?.addEventListener("statechange", () =>
            setUpdateReady(Boolean(value.waiting)),
          );
        });
      })
      .catch(() => setUpdateBlocked(true));
    return () => {
      navigator.serviceWorker.removeEventListener("message", message);
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
    };
  }, []);
  return {
    updateReady,
    updateBlocked,
    applyUpdate: async () => {
      if (dirtyRef.current) return;
      requested.current = true;
      registration.current?.waiting?.postMessage({ type: "ACTIVATE" });
    },
  };
}
