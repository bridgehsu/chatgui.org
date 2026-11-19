import {
  detectBrowserAI,
  streamBrowserChat,
  browserStatusLabel,
} from "./browserAI";
import { fetchModels, friendlyError, streamChat } from "./openai";
import type { BrowserAIStatus, ChatMessage, EngineMode, Settings } from "../types";

export type ProbeResult = {
  ok: boolean;
  label: string;
  browserStatus?: BrowserAIStatus;
  models?: string[];
  suggestedModel?: string;
  message?: string;
};

export async function probeProvider(settings: Settings): Promise<ProbeResult> {
  if (settings.engine === "browser") {
    const { status } = await detectBrowserAI();
    if (status === "readily") {
      return {
        ok: true,
        label: "Gemini Nano",
        browserStatus: status,
        suggestedModel: "Gemini Nano",
      };
    }
    if (status === "downloadable") {
      return {
        ok: false,
        label: browserStatusLabel(status),
        browserStatus: status,
        message:
          "浏览器支持本地 AI，但模型尚未就绪。首次使用可能需要下载；也可先改用本机 Ollama。",
      };
    }
    return {
      ok: false,
      label: browserStatusLabel(status),
      browserStatus: status,
      message:
        "当前环境无法使用浏览器本地模型。请切换到「本机模型」或「自定义 API」。",
    };
  }

  try {
    const models = await fetchModels(settings.baseUrl, settings.apiKey);
    if (!models.length) {
      return {
        ok: false,
        label: "无模型",
        models,
        message: "服务已通，但没有模型。请先在 Ollama / LM Studio 下载一个。",
      };
    }
    const suggestedModel =
      settings.model && models.includes(settings.model)
        ? settings.model
        : models[0];
    return { ok: true, label: suggestedModel, models, suggestedModel };
  } catch (err) {
    return {
      ok: false,
      label: "未连接",
      message: friendlyError(err),
    };
  }
}

export async function streamWithProvider(options: {
  settings: Settings;
  messages: Pick<ChatMessage, "role" | "content">[];
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
}) {
  const { settings } = options;
  if (settings.engine === "browser") {
    await streamBrowserChat({
      messages: options.messages,
      signal: options.signal,
      onDelta: options.onDelta,
    });
    return;
  }

  if (!settings.baseUrl) throw new Error("请先填写服务地址（Base URL）");
  if (!settings.model) throw new Error("请先选择或填写模型名称");

  await streamChat({
    baseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    messages: options.messages,
    signal: options.signal,
    onDelta: options.onDelta,
  });
}

export function engineHint(settings: Settings, browserStatus?: BrowserAIStatus) {
  if (settings.engine === "browser") {
    return `浏览器本地 · ${browserStatusLabel(browserStatus || "unsupported")}`;
  }
  if (settings.engine === "local") {
    return `${settings.baseUrl || "未设置"} · ${settings.model || "未选择模型"}`;
  }
  return `${settings.baseUrl || "自定义 API"} · ${settings.model || "未选择模型"}`;
}

export function canSend(settings: Settings, browserStatus?: BrowserAIStatus) {
  if (settings.engine === "browser") {
    return browserStatus === "readily" || browserStatus === "downloadable";
  }
  return Boolean(settings.baseUrl && settings.model);
}

export const ENGINE_OPTIONS: Array<{ key: EngineMode; zh: string; en: string }> = [
  { key: "browser", zh: "浏览器本地", en: "Browser" },
  { key: "local", zh: "本机模型", en: "Local" },
  { key: "custom", zh: "自定义 API", en: "Custom API" },
];
