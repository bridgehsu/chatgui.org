import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import {
  applyBackupPayload,
  BACKUP_FILENAME,
  clearDirectoryHandle,
  downloadBackupFile,
  importBackupFromFile,
  isFsAccessSupported,
  loadDirectoryHandle,
  pickBackupDirectory,
  readBackupFromDirectory,
  writeBackupToDirectory,
} from "../lib/backupFs";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BackupPanel({ open, onClose }: Props) {
  const { t } = useI18n();
  const supported = isFsAccessSupported();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dirName, setDirName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState<"ok" | "bad" | "">("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMsg("");
    setMsgKind("");
    void (async () => {
      try {
        const handle = await loadDirectoryHandle();
        if (!cancelled) setDirName(handle?.name ?? null);
      } catch {
        if (!cancelled) setDirName(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function show(text: string, kind: "ok" | "bad" = "ok") {
    setMsg(text);
    setMsgKind(kind);
  }

  async function chooseFolder() {
    setBusy(true);
    try {
      const handle = await pickBackupDirectory();
      setDirName(handle.name);
      show(t("backupFolderSet").replace("{name}", handle.name));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      show(t("backupFolderFailed"), "bad");
    } finally {
      setBusy(false);
    }
  }

  async function backupNow() {
    setBusy(true);
    try {
      let handle = await loadDirectoryHandle();
      if (!handle) {
        handle = await pickBackupDirectory();
        setDirName(handle.name);
      }
      const { fileName } = await writeBackupToDirectory(handle);
      show(t("backupSaved").replace("{file}", fileName));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof Error && err.message === "PERMISSION_DENIED") {
        show(t("backupPermissionDenied"), "bad");
        return;
      }
      show(t("backupFailed"), "bad");
    } finally {
      setBusy(false);
    }
  }

  async function restoreNow() {
    if (!window.confirm(t("backupRestoreConfirm"))) return;
    setBusy(true);
    try {
      let handle = await loadDirectoryHandle();
      if (!handle) {
        handle = await pickBackupDirectory();
        setDirName(handle.name);
      }
      const payload = await readBackupFromDirectory(handle);
      applyBackupPayload(payload);
      show(t("backupRestored"));
      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof Error && err.message === "PERMISSION_DENIED") {
        show(t("backupPermissionDenied"), "bad");
        return;
      }
      if (
        err instanceof DOMException &&
        (err.name === "NotFoundError" || err.name === "NotAllowedError")
      ) {
        show(t("backupFileMissing").replace("{file}", BACKUP_FILENAME), "bad");
        return;
      }
      show(t("backupRestoreFailed"), "bad");
    } finally {
      setBusy(false);
    }
  }

  async function clearFolder() {
    setBusy(true);
    try {
      await clearDirectoryHandle();
      setDirName(null);
      show(t("backupFolderCleared"));
    } catch {
      show(t("backupFailed"), "bad");
    } finally {
      setBusy(false);
    }
  }

  function downloadFallback() {
    try {
      downloadBackupFile();
      show(t("backupDownloaded"));
    } catch {
      show(t("backupFailed"), "bad");
    }
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!window.confirm(t("backupRestoreConfirm"))) return;
    setBusy(true);
    try {
      await importBackupFromFile(file);
      show(t("backupRestored"));
      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      show(t("backupRestoreFailed"), "bad");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!open) return null;

  return (
    <div
      className="drawer-overlay open"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="model-drawer open backup-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backupTitle"
      >
        <header className="model-drawer-head">
          <h2 id="backupTitle">{t("backupTitle")}</h2>
          <button
            type="button"
            className="model-drawer-close"
            aria-label={t("close")}
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="model-drawer-body">
          <p className="backup-lead">{t("backupLead")}</p>

          {supported ? (
            <>
              <div className="backup-card">
                <div className="backup-card-row">
                  <span className="backup-label">{t("backupFolder")}</span>
                  <strong className="backup-value">
                    {dirName || t("backupFolderNone")}
                  </strong>
                </div>
                <p className="model-hint">{t("backupFolderHint")}</p>
                <div className="backup-actions">
                  <button
                    type="button"
                    className="model-drawer-save"
                    disabled={busy}
                    onClick={() => void chooseFolder()}
                  >
                    {t("backupChooseFolder")}
                  </button>
                  {dirName ? (
                    <button
                      type="button"
                      className="model-drawer-cancel"
                      disabled={busy}
                      onClick={() => void clearFolder()}
                    >
                      {t("backupClearFolder")}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="backup-card">
                <div className="backup-card-row">
                  <span className="backup-label">{t("backupActions")}</span>
                </div>
                <p className="model-hint">
                  {t("backupFileHint").replace("{file}", BACKUP_FILENAME)}
                </p>
                <div className="backup-actions">
                  <button
                    type="button"
                    className="model-drawer-save"
                    disabled={busy}
                    onClick={() => void backupNow()}
                  >
                    {t("backupNow")}
                  </button>
                  <button
                    type="button"
                    className="model-drawer-cancel"
                    disabled={busy}
                    onClick={() => void restoreNow()}
                  >
                    {t("backupRestore")}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="backup-card">
              <p className="model-hint">{t("backupUnsupported")}</p>
            </div>
          )}

          <div className="backup-card">
            <div className="backup-card-row">
              <span className="backup-label">{t("backupFallback")}</span>
            </div>
            <p className="model-hint">{t("backupFallbackHint")}</p>
            <div className="backup-actions">
              <button
                type="button"
                className="model-drawer-cancel"
                disabled={busy}
                onClick={downloadFallback}
              >
                {t("backupDownload")}
              </button>
              <button
                type="button"
                className="model-drawer-cancel"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                {t("backupImportFile")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => void onPickFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {msg ? (
            <p className={`backup-msg${msgKind === "bad" ? " bad" : ""}`}>{msg}</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
