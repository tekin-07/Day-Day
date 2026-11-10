import { describe, expect, it } from "vitest";
import {
  addDays,
  conflicts,
  type EventRecord,
  localDate,
  monthDates,
  type Occurrence,
  occurrences,
  suggestTime,
  weekDates,
} from "./index";

const event: EventRecord = {
  id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  title: "Demo",
  startDate: "2024-01-31",
  time: "23:30",
  durationMinutes: 60,
  frequency: "monthly",
  weekdays: [],
  note: "",
  category: "",
  createdAt: 0,
  updatedAt: 0,
  versions: [],
};
const occurrence: Occurrence = {
  key: "a",
  eventId: "a",
  date: "2024-02-01",
  time: "00:00",
  title: "Demo",
  durationMinutes: 30,
  note: "",
  category: "",
};
describe("calendar rules", () => {
  it("uses Istanbul midnight and Monday weeks", () => {
    expect(localDate(1706734800000)).toBe("2024-02-01");
    expect(weekDates("2024-02-04")[0]).toBe("2024-01-29");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(monthDates("2024-02-15")).toHaveLength(29);
  });
  it("clamps monthly recurrence while retaining original anchor", () => {
    expect(occurrences([event], "2024-01-01", "2024-03-31").map((x) => x.date)).toEqual([
      "2024-01-31",
      "2024-02-29",
      "2024-03-31",
    ]);
  });
  it("uses selected weekdays and never generates before start", () => {
    const weekly = {
      ...event,
      frequency: "weekly" as const,
      startDate: "2024-02-01",
      weekdays: [1, 5],
    };
    expect(occurrences([weekly], "2024-01-29", "2024-02-05").map((x) => x.date)).toEqual([
      "2024-02-02",
      "2024-02-05",
    ]);
  });
  it("preserves prior schedules when a series changes", () => {
    const edited = {
      ...event,
      startDate: "2024-02-05",
      time: "10:00",
      frequency: "daily" as const,
      versions: [
        { ...event, effectiveFrom: "2024-01-31" },
        {
          ...event,
          startDate: "2024-02-05",
          time: "10:00",
          frequency: "daily" as const,
          effectiveFrom: "2024-02-05",
        },
      ],
    };
    expect(occurrences([edited], "2024-01-31", "2024-02-06").map((x) => [x.date, x.time])).toEqual([
      ["2024-01-31", "23:30"],
      ["2024-02-05", "10:00"],
      ["2024-02-06", "10:00"],
    ]);
  });
  it("finds cross-midnight conflicts but permits touching endpoints and flexible blocks", () => {
    const prior = {
      ...occurrence,
      key: "prior",
      eventId: "prior",
      date: "2024-01-31",
      time: "23:30",
      durationMinutes: 60,
    };
    expect(conflicts(occurrence, [prior])).toEqual([prior]);
    expect(conflicts({ ...occurrence, time: "00:30" }, [prior])).toEqual([]);
    expect(conflicts({ ...occurrence, time: null }, [prior])).toEqual([]);
    expect(suggestTime(occurrence, [prior])).toBe("00:30");
  });
  it("does not suggest a slot spilling past the same date", () => {
    expect(suggestTime({ ...occurrence, time: "23:30", durationMinutes: 60 }, [])).toBeNull();
  });
});
