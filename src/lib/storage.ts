import type {
  Conversation,
  CustomPreset,
  EngineMode,
  LocalPreset,
  PresetKey,
  Settings,
} from "../types";
import { detectBrowserAI } from "./browserAI";

export const SETTINGS_KEY = "chatgui.settings.v1";
export const CHATS_KEY = "chatgui.chats.v1";

export const LOCAL_PRESETS: Record<LocalPreset, { baseUrl: string; label: string }> = {
  ollama: { baseUrl: "http://localhost:11434/v1", label: "Ollama" },
  lmstudio: { baseUrl: "http://localhost:1234/v1", label: "LM Studio" },
};

export const CUSTOM_PRESETS: Record<CustomPreset, { baseUrl: string; label: string }> = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", label: "OpenRouter" },
  custom: { baseUrl: "", label: "自定义" },
};

/** @deprecated keep for migration lookups */
export const PRESETS = { ...LOCAL_PRESETS, ...CUSTOM_PRESETS };

export const defaultSettings: Settings = {
  engine: "local",
  preset: "ollama",
  baseUrl: LOCAL_PRESETS.ollama.baseUrl,
  apiKey: "",
  model: "",
};

function inferEngine(preset: PresetKey, baseUrl: string): EngineMode {
  if (preset === "openrouter" || preset === "custom") return "custom";
  if (baseUrl.includes("openrouter.ai")) return "custom";
  return "local";
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<Settings> & { preset?: PresetKey };
    const preset = (parsed.preset || "ollama") as PresetKey;
    const baseUrl = parsed.baseUrl ?? defaultSettings.baseUrl;
    const engine =
      parsed.engine ||
      inferEngine(preset, baseUrl);
    return {
      ...defaultSettings,
      ...parsed,
      engine,
      preset,
      baseUrl,
      apiKey: parsed.apiKey ?? "",
      model: parsed.model ?? "",
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function hasSavedSettings() {
  try {
    return Boolean(localStorage.getItem(SETTINGS_KEY));
  } catch {
    return false;
  }
}

/** 首次访问：浏览器本地可用则优先，否则本机 Ollama */
export async function resolveInitialSettings(): Promise<Settings> {
  if (hasSavedSettings()) return loadSettings();

  const { status } = await detectBrowserAI();
  if (status === "readily") {
    const next: Settings = {
      ...defaultSettings,
      engine: "browser",
      model: "Gemini Nano",
    };
    saveSettings(next);
    return next;
  }

  const next = { ...defaultSettings, engine: "local" as const };
  saveSettings(next);
  return next;
}

export function settingsForEngine(
  engine: EngineMode,
  prev: Settings,
): Settings {
  if (engine === "browser") {
    return {
      ...prev,
      engine,
      model: prev.engine === "browser" && prev.model ? prev.model : "Gemini Nano",
    };
  }
  if (engine === "local") {
    const preset: LocalPreset =
      prev.preset === "lmstudio" ? "lmstudio" : "ollama";
    return {
      ...prev,
      engine,
      preset,
      baseUrl: LOCAL_PRESETS[preset].baseUrl,
      apiKey: "",
      model: prev.engine === "local" ? prev.model : "",
    };
  }
  const preset: CustomPreset =
    prev.preset === "openrouter" || prev.preset === "custom"
      ? prev.preset
      : "openrouter";
  return {
    ...prev,
    engine,
    preset,
    baseUrl:
      preset === "custom"
        ? prev.baseUrl && !prev.baseUrl.includes("localhost")
          ? prev.baseUrl
          : ""
        : CUSTOM_PRESETS.openrouter.baseUrl,
    model: prev.engine === "custom" ? prev.model : "",
  };
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversations(chats: Conversation[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function titleFromMessages(messages: Conversation["messages"]) {
  const first = messages.find((m) => m.role === "user" && m.content.trim());
  if (!first) return "新对话";
  const t = first.content.trim().replace(/\s+/g, " ");
  return t.length > 28 ? `${t.slice(0, 28)}…` : t;
}
