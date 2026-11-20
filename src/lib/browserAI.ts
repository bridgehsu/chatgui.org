import type { BrowserAIStatus, ChatMessage } from "../types";

type Availability =
  | "readily"
  | "available"
  | "after-download"
  | "downloadable"
  | "unavailable"
  | string;

type PromptSession = {
  prompt: (input: string) => Promise<string>;
  promptStreaming?: (input: string) => AsyncIterable<string> | ReadableStream<string>;
  destroy?: () => void;
};

type LanguageModelAPI = {
  availability?: (options?: Record<string, unknown>) => Promise<Availability>;
  capabilities?: () => Promise<{ available?: Availability }>;
  create: (options?: Record<string, unknown>) => Promise<PromptSession>;
};

function getLanguageModelAPI(): LanguageModelAPI | null {
  const g = globalThis as Record<string, unknown>;
  if (g.LanguageModel && typeof g.LanguageModel === "object") {
    return g.LanguageModel as LanguageModelAPI;
  }
  const ai = g.ai as { languageModel?: LanguageModelAPI } | undefined;
  if (ai?.languageModel) return ai.languageModel;
  return null;
}

function normalizeStatus(raw: Availability | undefined): BrowserAIStatus {
  const v = String(raw || "").toLowerCase();
  if (v === "readily" || v === "available") return "readily";
  if (v === "after-download" || v === "downloadable") return "downloadable";
  if (v === "unavailable" || v === "no") return "unavailable";
  return "unsupported";
}

export async function detectBrowserAI(): Promise<{
  status: BrowserAIStatus;
  api: LanguageModelAPI | null;
}> {
  const api = getLanguageModelAPI();
  if (!api) return { status: "unsupported", api: null };

  try {
    if (typeof api.availability === "function") {
      const raw = await api.availability();
      return { status: normalizeStatus(raw), api };
    }
    if (typeof api.capabilities === "function") {
      const caps = await api.capabilities();
      return { status: normalizeStatus(caps.available), api };
    }
    // API exists but no availability helper — treat as downloadable/tryable
    return { status: "downloadable", api };
  } catch {
    return { status: "unavailable", api };
  }
}

function buildPrompt(messages: Pick<ChatMessage, "role" | "content">[]) {
  const lines = messages
    .filter((m) => m.role !== "system" || m.content.trim())
    .map((m) => {
      const who =
        m.role === "user" ? "User" : m.role === "assistant" ? "Assistant" : "System";
      return `${who}: ${m.content}`;
    });
  lines.push("Assistant:");
  return lines.join("\n\n");
}

async function readStreamLike(
  stream: AsyncIterable<string> | ReadableStream<string>,
  onDelta: (delta: string) => void,
) {
  if (Symbol.asyncIterator in Object(stream)) {
    let previous = "";
    for await (const chunk of stream as AsyncIterable<string>) {
      const text = String(chunk ?? "");
      // Some implementations yield cumulative text
      if (text.startsWith(previous)) {
        const delta = text.slice(previous.length);
        previous = text;
        if (delta) onDelta(delta);
      } else {
        previous += text;
        if (text) onDelta(text);
      }
    }
    return;
  }

  const reader = (stream as ReadableStream<string>).getReader();
  let previous = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = String(value ?? "");
    if (text.startsWith(previous)) {
      const delta = text.slice(previous.length);
      previous = text;
      if (delta) onDelta(delta);
    } else if (text) {
      previous += text;
      onDelta(text);
    }
  }
}

export async function streamBrowserChat(options: {
  messages: Pick<ChatMessage, "role" | "content">[];
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
}) {
  const { api, status } = await detectBrowserAI();
  if (!api) {
    throw new Error(
      "当前浏览器不支持本地 AI（需要较新的 Chrome，并启用内置 Prompt API）。请切换到「本机模型」或「自定义 API」。",
    );
  }
  if (status === "unavailable" || status === "unsupported") {
    throw new Error(
      "浏览器本地模型不可用。请切换到「本机模型」（Ollama）或「自定义 API」。",
    );
  }

  const session = await api.create({
    temperature: 0.8,
    topK: 40,
  });

  const onAbort = () => {
    try {
      session.destroy?.();
    } catch {
      /* ignore */
    }
  };
  options.signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const input = buildPrompt(options.messages);
    if (typeof session.promptStreaming === "function") {
      const stream = session.promptStreaming(input);
      await readStreamLike(stream, options.onDelta);
    } else {
      const text = await session.prompt(input);
      if (text) options.onDelta(text);
    }
  } finally {
    options.signal?.removeEventListener("abort", onAbort);
    try {
      session.destroy?.();
    } catch {
      /* ignore */
    }
  }
}

export function browserStatusLabel(status: BrowserAIStatus, locale: "zh" | "en" = "en") {
  if (locale === "en") {
    switch (status) {
      case "readily":
        return "Ready";
      case "downloadable":
        return "Needs download";
      case "unavailable":
        return "Unavailable";
      default:
        return "Unsupported";
    }
  }
  switch (status) {
    case "readily":
      return "已就绪";
    case "downloadable":
      return "需下载模型";
    case "unavailable":
      return "不可用";
    default:
      return "不支持";
  }
}
