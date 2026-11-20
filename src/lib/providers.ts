import type { Settings } from "../types";
import { CUSTOM_PRESETS, LOCAL_PRESETS, settingsForEngine } from "./storage";

export type BuiltinProviderId =
  | "chrome"
  | "ollama"
  | "lmstudio"
  | "openrouter"
  | "custom";

export type BuiltinProvider = {
  id: BuiltinProviderId;
  zh: string;
  en: string;
  hintZh: string;
  hintEn: string;
  typeZh: string;
  typeEn: string;
  endpoint: string;
  /** Models always offered in the picker for this source */
  suggestedModels: string[];
};

/** Built-in sources shown by default on the Settings page */
export const BUILTIN_PROVIDERS: BuiltinProvider[] = [
  {
    id: "chrome",
    zh: "Chrome 浏览器",
    en: "Chrome browser",
    hintZh: "内置 Gemini Nano，免安装试用",
    hintEn: "Built-in Gemini Nano, zero install",
    typeZh: "浏览器",
    typeEn: "Browser",
    endpoint: "Prompt API / Gemini Nano",
    suggestedModels: ["Gemini Nano"],
  },
  {
    id: "ollama",
    zh: "Ollama",
    en: "Ollama",
    hintZh: "本机 localhost:11434",
    hintEn: "Local localhost:11434",
    typeZh: "本机",
    typeEn: "Local",
    endpoint: "http://localhost:11434/v1",
    suggestedModels: ["llama3.2", "llama3.1", "qwen2.5", "mistral", "gemma2"],
  },
  {
    id: "lmstudio",
    zh: "LM Studio",
    en: "LM Studio",
    hintZh: "本机 localhost:1234",
    hintEn: "Local localhost:1234",
    typeZh: "本机",
    typeEn: "Local",
    endpoint: "http://localhost:1234/v1",
    suggestedModels: [],
  },
  {
    id: "openrouter",
    zh: "OpenRouter",
    en: "OpenRouter",
    hintZh: "云端，需 API Key",
    hintEn: "Cloud, API key required",
    typeZh: "三方",
    typeEn: "Third-party",
    endpoint: "https://openrouter.ai/api/v1",
    suggestedModels: [
      "openai/gpt-4o-mini",
      "google/gemini-2.0-flash-001",
      "anthropic/claude-3.5-sonnet",
    ],
  },
  {
    id: "custom",
    zh: "自定义 API",
    en: "Custom API",
    hintZh: "任意 OpenAI 兼容接口",
    hintEn: "Any OpenAI-compatible endpoint",
    typeZh: "三方",
    typeEn: "Third-party",
    endpoint: "—",
    suggestedModels: [],
  },
];

export function providerFromSettings(settings: Settings): BuiltinProviderId {
  if (settings.engine === "browser") return "chrome";
  if (settings.engine === "local") {
    return settings.preset === "lmstudio" ? "lmstudio" : "ollama";
  }
  if (settings.preset === "openrouter") return "openrouter";
  return "custom";
}

export function settingsFromProvider(
  id: BuiltinProviderId,
  prev: Settings,
): Settings {
  if (id === "chrome") return settingsForEngine("browser", prev);
  if (id === "ollama") {
    return {
      ...settingsForEngine("local", prev),
      preset: "ollama",
      baseUrl: LOCAL_PRESETS.ollama.baseUrl,
      apiKey: "",
    };
  }
  if (id === "lmstudio") {
    return {
      ...settingsForEngine("local", prev),
      preset: "lmstudio",
      baseUrl: LOCAL_PRESETS.lmstudio.baseUrl,
      apiKey: "",
    };
  }
  if (id === "openrouter") {
    return {
      ...settingsForEngine("custom", prev),
      preset: "openrouter",
      baseUrl: CUSTOM_PRESETS.openrouter.baseUrl,
    };
  }
  return {
    ...settingsForEngine("custom", prev),
    preset: "custom",
    baseUrl:
      prev.engine === "custom" && prev.preset === "custom" ? prev.baseUrl : "",
  };
}

export function suggestedModelsForSettings(settings: Settings): string[] {
  const id = providerFromSettings(settings);
  const found = BUILTIN_PROVIDERS.find((p) => p.id === id);
  return found?.suggestedModels ?? [];
}
