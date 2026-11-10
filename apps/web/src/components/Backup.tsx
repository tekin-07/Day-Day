import { localDate, type Settings } from "@gungun/core";
import { exportBackup, previewBackup, recordBackup, restoreBackup } from "@gungun/data";
import { useEffect, useState } from "react";
import { backupFileName, downloadText, validateExportPassword } from "../backup-files";
import { formatInstant } from "../display";
import { tr } from "../i18n/tr";
import { Modal } from "./Modal";
import { RestorePreviewPanel } from "./RestorePreviewPanel";

type Preview = Awaited<ReturnType<typeof previewBackup>>;
type Props = {
  settings: Settings;
  dirty: (value: boolean) => void;
  notify: (message: string) => void;
};
export function Backup({ settings, dirty, notify }: Props) {
  const [mode, setMode] = useState<"export" | "restore" | null>(null);
  return (
    <section className="section">
      <h2>{tr.backup}</h2>
      <p>{tr.localRisk}</p>
      <p className="muted">
        {tr.lastBackup}:{" "}
        {settings.lastBackupAt ? formatInstant(settings.lastBackupAt) : tr.neverBackup}
      </p>
      <div className="stack">
        <button type="button" onClick={() => setMode("export")}>
          {tr.export}
        </button>
        <button type="button" onClick={() => setMode("restore")}>
          {tr.restore}
        </button>
      </div>
      {mode && (
        <BackupDialog mode={mode} close={() => setMode(null)} dirty={dirty} notify={notify} />
      )}
    </section>
  );
}

function BackupDialog({
  mode,
  close,
  dirty,
  notify,
}: {
  mode: "export" | "restore";
  close: () => void;
  dirty: Props["dirty"];
  notify: Props["notify"];
}) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [encrypted, setEncrypted] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dirty(Boolean(password || again || file));
    return () => dirty(false);
  }, [password, again, file, dirty]);
  const clear = () => {
    setPassword("");
    setAgain("");
    setEncrypted("");
    setPreview(null);
    setFile(null);
    dirty(false);
    close();
  };
  const work = async (action: () => Promise<void>, message = tr.cryptoError) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError(message);
    } finally {
      setBusy(false);
    }
  };
  const prepare = () =>
    work(async () => {
      if (mode === "export") {
        if (!validateExportPassword(password, again)) {
          setError(tr.passwordError);
          return;
        }
        setEncrypted(await exportBackup(password));
      } else if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError(tr.cryptoError);
          return;
        }
        setPreview(await previewBackup(await file.text(), password));
      }
    });
  const deliver = (share = false) =>
    work(async () => {
      const filename = backupFileName(localDate(Date.now()));
      if (share)
        await navigator.share({
          files: [new File([encrypted], filename, { type: "application/octet-stream" })],
        });
      else downloadText(encrypted, filename);
      await recordBackup();
      notify(tr.filesNotice);
      clear();
    }, tr.error);
  const recover = () =>
    work(async () => {
      downloadText(await exportBackup(password), backupFileName(localDate(Date.now())));
      notify(tr.filesNotice);
    }, tr.error);
  const restore = () =>
    work(async () => {
      if (preview) {
        await restoreBackup(preview);
        notify(tr.restored);
        clear();
      }
    }, tr.staleRestore);
  const discard = () => {
    clear();
    notify(tr.cancelled);
  };
  const cancel = () => {
    if (password || again || file) setDiscarding(true);
    else discard();
  };
  return (
    <Modal
      title={mode === "export" ? tr.export : tr.restore}
      description={tr.passwordHint}
      close={busy ? () => {} : cancel}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void prepare();
        }}
      >
        <fieldset disabled={busy}>
          <div className="stack">
            {mode === "restore" && (
              <label>
                {tr.backupFile}
                <input
                  type="file"
                  accept=".gungun"
                  required
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setPreview(null);
                    setConfirm(false);
                    setError("");
                  }}
                />
              </label>
            )}
            <label>
              {tr.password}
              <input
                type="password"
                autoComplete={mode === "export" ? "new-password" : "current-password"}
                required
                minLength={mode === "export" ? 10 : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setEncrypted("");
                  setPreview(null);
                  setConfirm(false);
                }}
              />
            </label>
            {mode === "export" && (
              <label>
                {tr.passwordAgain}
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={again}
                  onChange={(e) => {
                    setAgain(e.target.value);
                    setEncrypted("");
                  }}
                />
              </label>
            )}
            <button className="primary" type="submit">
              {busy ? tr.preparing : mode === "export" ? tr.export : tr.checkFile}
            </button>
          </div>
        </fieldset>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {encrypted && (
        <div className="stack">
          <p role="status">{tr.exportReady}</p>
          <button type="button" disabled={busy} onClick={() => void deliver()}>
            {tr.download}
          </button>
          {canShareFile(encrypted) && (
            <button type="button" disabled={busy} onClick={() => void deliver(true)}>
              {tr.share}
            </button>
          )}
          <p className="muted">{tr.filesNotice}</p>
        </div>
      )}
      {preview && (
        <RestorePreviewPanel
          preview={preview}
          size={file?.size ?? 0}
          busy={busy}
          recover={() => void recover()}
          overwrite={() => setConfirm(true)}
        />
      )}
      <button type="button" disabled={busy} className="full quiet" onClick={cancel}>
        {tr.cancel}
      </button>
      {discarding && (
        <Modal
          title={tr.discardTitle}
          description={tr.discardText}
          close={() => setDiscarding(false)}
        >
          <div className="stack">
            <button type="button" onClick={() => setDiscarding(false)}>
              {tr.stay}
            </button>
            <button type="button" onClick={discard}>
              {tr.discard}
            </button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal
          title={tr.overwriteTitle}
          description={tr.overwriteText}
          close={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <div className="stack">
            <button type="button" className="danger" disabled={busy} onClick={() => void restore()}>
              {busy ? tr.preparing : tr.confirmOverwrite}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirm(false)}>
              {tr.cancel}
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </Modal>
      )}
    </Modal>
  );
}

function canShareFile(text: string) {
  if (!navigator.canShare) return false;
  return navigator.canShare({
    files: [new File([text], "gungun.gungun", { type: "application/octet-stream" })],
  });
}
