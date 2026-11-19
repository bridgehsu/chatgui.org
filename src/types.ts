export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
  error?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

/** 三档引擎：浏览器本地 / 本机模型 / 自定义 API */
export type EngineMode = "browser" | "local" | "custom";

export type LocalPreset = "ollama" | "lmstudio";
export type CustomPreset = "openrouter" | "custom";
export type PresetKey = LocalPreset | CustomPreset;

export type Settings = {
  engine: EngineMode;
  preset: PresetKey;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ConnectionStatus = {
  kind: "" | "ok" | "bad" | "busy";
  text: string;
};

export type BrowserAIStatus =
  | "readily"
  | "downloadable"
  | "unavailable"
  | "unsupported";
