import type { RestorePreview } from "@gungun/data";
import { tr } from "../i18n/tr";
export function RestorePreviewPanel({
  preview,
  size,
  busy,
  recover,
  overwrite,
}: {
  preview: RestorePreview;
  size: number;
  busy: boolean;
  recover: () => void;
  overwrite: () => void;
}) {
  return (
    <section className="preview">
      <h3>{tr.preview}</h3>
      <dl>
        <dt>{tr.recordCount}</dt>
        <dd>{preview.count}</dd>
        <dt>{tr.fileSize}</dt>
        <dd>
          {new Intl.NumberFormat(tr.locale).format(size)} {tr.bytes}
        </dd>
      </dl>
      <dl>
        <dt>{tr.settingsCount}</dt>
        <dd>{preview.payload.settings.length}</dd>
        <dt>{tr.eventsCount}</dt>
        <dd>{preview.payload.events.length}</dd>
        <dt>{tr.completionsCount}</dt>
        <dd>{preview.payload.completions.length}</dd>
      </dl>
      <p>{tr.mediaCount}</p>
      <p>{tr.recoveryHint}</p>
      <div className="stack">
        <button type="button" disabled={busy} onClick={recover}>
          {tr.recovery}
        </button>
        <button type="button" disabled={busy} className="danger" onClick={overwrite}>
          {tr.overwrite}
        </button>
      </div>
    </section>
  );
}
