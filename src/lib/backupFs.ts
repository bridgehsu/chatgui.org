import {
  ACTIVE_MODEL_KEY,
  loadActiveModelId,
  loadModelEntries,
  MODELS_KEY,
  saveActiveModelId,
  saveModelEntries,
} from "./modelsStore";
import {
  CHATS_KEY,
  loadConversations,
  loadSettings,
  saveConversations,
  saveSettings,
  SETTINGS_KEY,
} from "./storage";
import type { Conversation, ModelEntry, Settings } from "../types";

export const BACKUP_FILENAME = "chatgui-backup.json";

const IDB_NAME = "chatgui.fs.v1";
const IDB_STORE = "handles";
const IDB_KEY = "backupDir";

const LOCALE_KEY = "chatgui_locale";
const THEME_KEY = "chatgui_theme";

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  chats: Conversation[];
  models: ModelEntry[];
  activeModelId: string | null;
  settings: Settings;
  locale: string | null;
  theme: string | null;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "read" | "readwrite";
  }) => Promise<FileSystemDirectoryHandle>;
};

export function isFsAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

export async function saveDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save handle"));
  });
  db.close();
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb();
  const handle = await new Promise<FileSystemDirectoryHandle | null>(
    (resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () =>
        resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null);
      req.onerror = () =>
        reject(req.error ?? new Error("Failed to load handle"));
    },
  );
  db.close();
  return handle;
}

export async function clearDirectoryHandle(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to clear handle"));
  });
  db.close();
}

export async function ensurePermission(
  handle: FileSystemDirectoryHandle,
  mode: "read" | "readwrite" = "readwrite",
): Promise<boolean> {
  const opts = { mode } as FileSystemHandlePermissionDescriptor;
  if ((await handle.queryPermission(opts)) === "granted") return true;
  if ((await handle.requestPermission(opts)) === "granted") return true;
  return false;
}

export async function pickBackupDirectory(): Promise<FileSystemDirectoryHandle> {
  const w = window as DirectoryPickerWindow;
  if (!w.showDirectoryPicker) {
    throw new Error("UNSUPPORTED");
  }
  const handle = await w.showDirectoryPicker({
    id: "chatgui-backup",
    mode: "readwrite",
  });
  await saveDirectoryHandle(handle);
  return handle;
}

export function collectBackupPayload(): BackupPayload {
  const models = loadModelEntries();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    chats: loadConversations(),
    models,
    activeModelId: loadActiveModelId(models),
    settings: loadSettings(),
    locale: localStorage.getItem(LOCALE_KEY),
    theme: localStorage.getItem(THEME_KEY),
  };
}

export function applyBackupPayload(payload: BackupPayload): void {
  if (!payload || payload.version !== 1) {
    throw new Error("INVALID_BACKUP");
  }
  if (Array.isArray(payload.chats)) {
    saveConversations(payload.chats);
  }
  if (Array.isArray(payload.models)) {
    saveModelEntries(payload.models);
  }
  if (payload.activeModelId !== undefined) {
    saveActiveModelId(payload.activeModelId);
  }
  if (payload.settings) {
    saveSettings(payload.settings);
  }
  if (payload.locale === "zh" || payload.locale === "en") {
    localStorage.setItem(LOCALE_KEY, payload.locale);
  }
  if (
    payload.theme === "light" ||
    payload.theme === "dark" ||
    payload.theme === "system"
  ) {
    localStorage.setItem(THEME_KEY, payload.theme);
  }
}

export async function writeBackupToDirectory(
  handle: FileSystemDirectoryHandle,
): Promise<{ fileName: string; bytes: number }> {
  const ok = await ensurePermission(handle, "readwrite");
  if (!ok) throw new Error("PERMISSION_DENIED");

  const payload = collectBackupPayload();
  const text = JSON.stringify(payload, null, 2);
  const fileHandle = await handle.getFileHandle(BACKUP_FILENAME, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
  return { fileName: BACKUP_FILENAME, bytes: new Blob([text]).size };
}

export async function readBackupFromDirectory(
  handle: FileSystemDirectoryHandle,
): Promise<BackupPayload> {
  const ok = await ensurePermission(handle, "read");
  if (!ok) throw new Error("PERMISSION_DENIED");

  const fileHandle = await handle.getFileHandle(BACKUP_FILENAME);
  const file = await fileHandle.getFile();
  const text = await file.text();
  const parsed = JSON.parse(text) as BackupPayload;
  if (!parsed || parsed.version !== 1) throw new Error("INVALID_BACKUP");
  return parsed;
}

/** Fallback download when FS Access is unavailable */
export function downloadBackupFile(): void {
  const payload = collectBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = BACKUP_FILENAME;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackupFromFile(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as BackupPayload;
  applyBackupPayload(parsed);
}

/** Keys referenced by backup (for docs / debugging) */
export const BACKUP_STORAGE_KEYS = [
  CHATS_KEY,
  SETTINGS_KEY,
  MODELS_KEY,
  ACTIVE_MODEL_KEY,
  LOCALE_KEY,
  THEME_KEY,
] as const;
