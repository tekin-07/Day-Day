import type { EventDraft } from "@gungun/core";
import { type eventFieldErrors, withFrequency } from "../event-preview";
import { tr } from "../i18n/tr";
export function EventFields({
  draft,
  patch,
  errors,
}: {
  draft: EventDraft;
  errors?: ReturnType<typeof eventFieldErrors>;
  patch: (value: Partial<EventDraft>) => void;
}) {
  return (
    <div className="stack">
      <label>
        {tr.title}
        <input
          id="event-title"
          aria-invalid={errors?.title || undefined}
          aria-describedby={errors?.title ? "title-error" : undefined}
          autoComplete="off"
          required
          maxLength={200}
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>
      {errors?.title && (
        <p className="error" id="title-error">
          {tr.titleError}
        </p>
      )}
      <label>
        {tr.date}
        <input
          id="event-date"
          aria-invalid={errors?.date || undefined}
          aria-describedby={errors?.date ? "date-error" : undefined}
          type="date"
          required
          value={draft.startDate}
          onChange={(e) => patch({ startDate: e.target.value })}
        />
      </label>
      {errors?.date && (
        <p className="error" id="date-error">
          {tr.dateError}
        </p>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={draft.time === null}
          onChange={(e) => patch({ time: e.target.checked ? null : "09:00" })}
        />
        {tr.flexibleLabel}
      </label>
      {draft.time !== null && (
        <div className="field-pair">
          <label>
            {tr.time}
            <input
              id="event-time"
              aria-invalid={errors?.time || undefined}
              aria-describedby={errors?.time ? "time-error" : undefined}
              type="time"
              required
              value={draft.time}
              onChange={(e) => patch({ time: e.target.value })}
            />
          </label>
          {errors?.time && (
            <p className="error" id="time-error">
              {tr.timeError}
            </p>
          )}
          <label>
            {tr.duration}
            <input
              id="event-duration"
              aria-invalid={errors?.duration || undefined}
              aria-describedby={errors?.duration ? "duration-error" : undefined}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              value={draft.durationMinutes || ""}
              onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
            />
          </label>
        </div>
      )}
      {errors?.duration && (
        <p className="error" id="duration-error">
          {tr.durationError}
        </p>
      )}
      <label>
        {tr.frequency}
        <select
          value={draft.frequency}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "once" || value === "daily" || value === "weekly" || value === "monthly")
              patch(withFrequency(draft, value));
          }}
        >
          {(["once", "daily", "weekly", "monthly"] as const).map((value) => (
            <option key={value} value={value}>
              {tr[value]}
            </option>
          ))}
        </select>
      </label>
      {draft.frequency === "weekly" && (
        <fieldset
          id="event-weekdays"
          tabIndex={-1}
          aria-describedby={errors?.weekdays ? "weekdays-error" : undefined}
        >
          <legend>{tr.weekly}</legend>
          <div className="weekdays">
            {tr.weekdays.map((name, index) => (
              <label className="check" key={name}>
                <input
                  type="checkbox"
                  checked={draft.weekdays.includes(index + 1)}
                  onChange={(e) =>
                    patch({
                      weekdays: e.target.checked
                        ? [...draft.weekdays, index + 1]
                        : draft.weekdays.filter((day) => day !== index + 1),
                    })
                  }
                />
                {name}
              </label>
            ))}
          </div>
          {errors?.weekdays && (
            <p className="error" id="weekdays-error">
              {tr.weekdaysError}
            </p>
          )}
        </fieldset>
      )}
      <label>
        {tr.category}
        <input
          maxLength={100}
          value={draft.category}
          onChange={(e) => patch({ category: e.target.value })}
        />
      </label>
      <label>
        {tr.note}
        <textarea
          rows={3}
          maxLength={10000}
          value={draft.note}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </label>
    </div>
  );
}
