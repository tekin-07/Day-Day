import { localDate } from "@gungun/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeClock } from "./clock";

afterEach(() => vi.useRealTimers());
describe("local clock refresh", () => {
  it("refreshes across Istanbul midnight and on resume; removes subscriptions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-11-07T20:59:50Z"));
    const focus = new EventTarget();
    const visibility = new EventTarget();
    const dates: string[] = [];
    const stop = subscribeClock((now) => dates.push(localDate(now)), focus, visibility);
    vi.advanceTimersByTime(10_000);
    expect(dates.at(-1)).toBe("2026-11-08");
    vi.setSystemTime(Date.parse("2026-11-08T21:05:00Z"));
    visibility.dispatchEvent(new Event("visibilitychange"));
    expect(dates.at(-1)).toBe("2026-11-09");
    stop();
    const count = dates.length;
    focus.dispatchEvent(new Event("focus"));
    vi.advanceTimersByTime(60_000);
    expect(dates).toHaveLength(count);
  });
});
