import type { EngineMode, ModelEntry, PresetKey, Settings } from "../types";
import { CUSTOM_PRESETS, LOCAL_PRESETS, saveSettings, uid } from "./storage";

export const MODELS_KEY = "chatgui.models.v1";
export const ACTIVE_MODEL_KEY = "chatgui.activeModelId.v1";

export function defaultModelEntries(): ModelEntry[] {
  return [
    {
      id: "chrome",
      name: "Chrome browser",
      engine: "browser",
      preset: "ollama",
      baseUrl: "",
      apiKey: "",
      model: "Gemini Nano",
    },
    {
      id: "ollama",
      name: "Ollama",
      engine: "local",
      preset: "ollama",
      baseUrl: LOCAL_PRESETS.ollama.baseUrl,
      apiKey: "",
      model: "llama3.2",
    },
    {
      id: "lmstudio",
      name: "LM Studio",
      engine: "local",
      preset: "lmstudio",
      baseUrl: LOCAL_PRESETS.lmstudio.baseUrl,
      apiKey: "",
      model: "",
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      engine: "custom",
      preset: "openrouter",
      baseUrl: CUSTOM_PRESETS.openrouter.baseUrl,
      apiKey: "",
      model: "openai/gpt-4o-mini",
    },
  ];
}

export function emptyModelDraft(): ModelEntry {
  return {
    id: "",
    name: "",
    engine: "custom",
    preset: "custom",
    baseUrl: "",
    apiKey: "",
    model: "",
  };
}

export function loadModelEntries(): ModelEntry[] {
  try {
    const raw = localStorage.getItem(MODELS_KEY);
    if (!raw) {
      const seeded = defaultModelEntries();
      saveModelEntries(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as ModelEntry[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = defaultModelEntries();
      saveModelEntries(seeded);
      return seeded;
    }
    return parsed.map(normalizeEntry);
  } catch {
    const seeded = defaultModelEntries();
    saveModelEntries(seeded);
    return seeded;
  }
}

function normalizeEntry(entry: Partial<ModelEntry>): ModelEntry {
  const engine = (entry.engine || "custom") as EngineMode;
  const preset = (entry.preset || "custom") as PresetKey;
  return {
    id: entry.id || uid(),
    name: (entry.name || "Untitled").trim() || "Untitled",
    engine,
    preset,
    baseUrl: entry.baseUrl || "",
    apiKey: entry.apiKey || "",
    model:
      engine === "browser"
        ? "Gemini Nano"
        : (entry.model || "").trim(),
  };
}

export function saveModelEntries(entries: ModelEntry[]) {
  localStorage.setItem(MODELS_KEY, JSON.stringify(entries));
}

export function loadActiveModelId(entries: ModelEntry[]): string | null {
  try {
    const saved = localStorage.getItem(ACTIVE_MODEL_KEY);
    if (saved && entries.some((e) => e.id === saved)) return saved;
  } catch {
    // ignore
  }
  return entries[0]?.id ?? null;
}

export function saveActiveModelId(id: string | null) {
  if (!id) {
    localStorage.removeItem(ACTIVE_MODEL_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_MODEL_KEY, id);
}

export function entryToSettings(entry: ModelEntry): Settings {
  if (entry.engine === "browser") {
    return {
      engine: "browser",
      preset: entry.preset || "ollama",
      baseUrl: "",
      apiKey: "",
      model: "Gemini Nano",
    };
  }
  if (entry.engine === "local") {
    const preset = entry.preset === "lmstudio" ? "lmstudio" : "ollama";
    return {
      engine: "local",
      preset,
      baseUrl: entry.baseUrl || LOCAL_PRESETS[preset].baseUrl,
      apiKey: "",
      model: entry.model,
    };
  }
  return {
    engine: "custom",
    preset: entry.preset === "openrouter" ? "openrouter" : "custom",
    baseUrl: entry.baseUrl,
    apiKey: entry.apiKey,
    model: entry.model,
  };
}

export function activateModelEntry(entry: ModelEntry) {
  saveActiveModelId(entry.id);
  saveSettings(entryToSettings(entry));
}

export function typeLabel(
  engine: EngineMode,
  locale: "zh" | "en",
): string {
  if (engine === "browser") return locale === "en" ? "Browser" : "浏览器";
  if (engine === "local") return locale === "en" ? "Local" : "本机";
  return locale === "en" ? "Third-party" : "三方";
}

export function endpointLabel(entry: ModelEntry): string {
  if (entry.engine === "browser") return "Prompt API / Gemini Nano";
  return entry.baseUrl || "—";
}
