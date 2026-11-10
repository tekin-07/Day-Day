import { useEffect, useState } from "react";

export function subscribeClock(
  update: (now: number) => void,
  focus: EventTarget = window,
  visibility: EventTarget = document,
) {
  let timer: ReturnType<typeof setTimeout>;
  const refresh = () => update(Date.now());
  const tick = () => {
    refresh();
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
  };
  tick();
  focus.addEventListener("focus", refresh);
  visibility.addEventListener("visibilitychange", refresh);
  return () => {
    clearTimeout(timer);
    focus.removeEventListener("focus", refresh);
    visibility.removeEventListener("visibilitychange", refresh);
  };
}
export function useCurrentInstant() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => subscribeClock(setNow), []);
  return now;
}
