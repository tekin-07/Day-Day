import type { EventDraft } from "@gungun/core";
import { describe, expect, it } from "vitest";
import { firstPreviewOccurrence, withFrequency } from "./event-preview";

const draft: EventDraft = {
  title: "Demo",
  startDate: "2026-11-07",
  time: "09:00",
  durationMinutes: 30,
  frequency: "monthly",
  weekdays: [],
  category: "",
  note: "",
};
describe("event form recurrence transitions", () => {
  it("drops hidden selected weekdays when leaving weekly repetition", () => {
    for (const frequency of ["once", "daily", "monthly"] as const)
      expect(
        withFrequency({ ...draft, frequency: "weekly", weekdays: [1, 5] }, frequency).weekdays,
      ).toEqual([]);
  });
  it("previews an edited monthly occurrence even when it is over a week away", () => {
    expect(firstPreviewOccurrence(draft, true, "2026-11-08")?.date).toBe("2026-12-07");
  });
});
it("reports the exact invalid field group before writing a form", async () => {
  const { eventFieldErrors } = await import("./event-preview");
  const errors = eventFieldErrors({
    ...draft,
    title: "  ",
    startDate: "bad",
    durationMinutes: 0,
    frequency: "weekly",
    weekdays: [],
  });
  expect(errors).toMatchObject({ title: true, date: true, duration: true, weekdays: true });
});
